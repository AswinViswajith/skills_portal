import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Input,
  Tabs,
  Card,
  message,
  Select,
  Button,
  Spin,
  Modal,
} from "antd";
import axiosInstance from "../../config/axios";
import moment from "moment";
import { useSelector } from "react-redux";
import CoursePage from "../course/CoursePage";

const { Title } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const FacultyDashboard = () => {
  const userName = useSelector((state) => state.persisted.user.user.name);
  const [metaData, setMetaData] = useState({});
  const [ongoing, setOngoing] = useState([]);
  const [past, setPast] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [viewingSkill, setViewingSkill] = useState({});
  const [showCourseModal, setShowCourseModal] = useState(false);


  const [loading, setLoading] = useState(true);

  const openCoursePage = (skill) => {
    setViewingSkill(skill);
    setShowCourseModal(true);
  };

  const closeCoursePage = () => {
    setViewingSkill(null);
    setShowCourseModal(false);
  };


  const fetchFacultyDashboard = async () => {
    try {
      const { data } = await axiosInstance.get("/skillSchedule/facultyDashboard");
      setMetaData(data.metaData);
      setOngoing(data.ongoing);
      setPast(data.past);
      setUpcoming(data.upcoming);


    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      message.error("Failed to fetch faculty dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchFacultyDashboard();
  }, []);

  const getUniqueFilters = (data, key) =>
    [...new Set(data.map((item) => item[key]))].map((value) => ({
      text: value,
      value,
    }));

  const getDepartmentFilters = (data) =>
    [...new Set(data.flatMap((item) => item.taggedDepartment))].map((dep) => ({
      text: dep,
      value: dep,
    }));




  const OngoingColumns = [
    {
      title: "Skill Name",
      dataIndex: "skillName",
      key: "skillName",
      filters: getUniqueFilters(ongoing, "skillName"),
      onFilter: (value, record) => record.skillName === value,
    },
    {
      title: "Organiser",
      dataIndex: "organiser",
      key: "organiser",
      filters: getUniqueFilters(ongoing, "organiser"),
      onFilter: (value, record) => record.organiser === value,
    },
    {
      title: "Department",
      dataIndex: "taggedDepartment",
      key: "taggedDepartment",
      filters: getDepartmentFilters(ongoing),
      onFilter: (value, record) =>
        record.taggedDepartment.includes(value),
      render: (dept) => dept.join(", "),
    },
    {
      title: "Year",
      dataIndex: "taggedYear",
      key: "taggedYear",
      filters: getUniqueFilters(ongoing, "taggedYear"),
      onFilter: (value, record) => record.taggedYear === value,
    },
    {
      title: "Start",
      dataIndex: "skillStartTime",
      key: "skillStartTime",
    },
    {
      title: "End",
      dataIndex: "skillEndTime",
      key: "skillEndTime",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button onClick={() => openCoursePage(record)}>View Details</Button>
        </div>
      ),
    },
  ];

  const UpcomingColumns = [
    {
      title: "Skill Name",
      dataIndex: "skillName",
      key: "skillName",
      filters: getUniqueFilters(upcoming, "skillName"),
      onFilter: (value, record) => record.skillName === value,
    },
    {
      title: "Organiser",
      dataIndex: "organiser",
      key: "organiser",
      filters: getUniqueFilters(upcoming, "organiser"),
      onFilter: (value, record) => record.organiser === value,
    },
    {
      title: "Department",
      dataIndex: "taggedDepartment",
      key: "taggedDepartment",
      filters: getDepartmentFilters(upcoming),
      onFilter: (value, record) =>
        record.taggedDepartment.includes(value),
      render: (dept) => dept.join(", "),
    },
    {
      title: "Year",
      dataIndex: "taggedYear",
      key: "taggedYear",
      filters: getUniqueFilters(upcoming, "taggedYear"),
      onFilter: (value, record) => record.taggedYear === value,
    },
    {
      title: "Start",
      dataIndex: "skillStartTime",
      key: "skillStartTime",
    },
    {
      title: "End",
      dataIndex: "skillEndTime",
      key: "skillEndTime",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button onClick={() =>openCoursePage(record)}>View Details</Button>
        </div>
      ),
    },
  ];

  const PastColumns = [
    {
      title: "Skill Name",
      dataIndex: "skillName",
      key: "skillName",
      filters: getUniqueFilters(past, "skillName"),
      onFilter: (value, record) => record.skillName === value,
    },
    {
      title: "Organiser",
      dataIndex: "organiser",
      key: "organiser",
      filters: getUniqueFilters(past, "organiser"),
      onFilter: (value, record) => record.organiser === value,
    },
    {
      title: "Department",
      dataIndex: "taggedDepartment",
      key: "taggedDepartment",
      filters: getDepartmentFilters(past),
      onFilter: (value, record) =>
        record.taggedDepartment.includes(value),
      render: (dept) => dept.join(", "),
    },
    {
      title: "Year",
      dataIndex: "taggedYear",
      key: "taggedYear",
      filters: getUniqueFilters(past, "taggedYear"),
      onFilter: (value, record) => record.taggedYear === value,
    },
    {
      title: "Start",
      dataIndex: "skillStartTime",
      key: "skillStartTime",
    },
    {
      title: "End",
      dataIndex: "skillEndTime",
      key: "skillEndTime",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button onClick={() => openCoursePage(record)}>View Details</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-4">
        Hi, {userName}
      </Title>

      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 shadow-lg">
          <div className="flex justify-end">
            <button
              className="text-xl text-gray-600 hover:text-black"
              onClick={closeCoursePage}
            >
              ✕
            </button>
          </div>
          <CoursePage skillId={viewingSkill._id} skill={viewingSkill} onClose={closeCoursePage} />
        </div>
      )}


      {/* 🔹 Stats Section */}
      <Spin spinning={loading}>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card title="Total Skills Scheduled" bordered>
            <Title level={4}>{metaData.totalSkillScheduled || 0}</Title>
          </Card>
          <Card title="Total Day Skills" bordered>
            <Title level={4}>{metaData.totalDaySkills || 0}</Title>
          </Card>
          <Card title="Total Night Skills" bordered>
            <Title level={4}>{metaData.totalNightSkills || 0}</Title>
          </Card>
          <Card title="Total Ongoing Skills" bordered>
            <Title style={{ color: "green" }} level={4}>{metaData.totalOngoingSkills || 0}</Title>
          </Card>
          <Card title="Total Upcoming Skills" bordered>
            <Title style={{ color: "orange" }} level={4}>{metaData.totalUpcomingSkills || 0}</Title>
          </Card>
          <Card title="Total Pending Requests" bordered>
            <Title level={4} style={{ color: "red" }}>{metaData.totalPending || 0}</Title>
          </Card>

        </div>
      </Spin>



      {/* 🔹 Tabs for Schedule & Attendance */}
      <Tabs defaultActiveKey="schedule">
        <TabPane tab="Ongoing Skills" key="ongoing">
          <Spin spinning={loading}>
            <Table
              dataSource={ongoing}
              columns={OngoingColumns}
              rowKey="_id"
              bordered
              pagination={{ pageSize: 100 }}
            />
          </Spin>
        </TabPane>
        <TabPane tab="Upcoming Skills" key="upcoming">
          <Spin spinning={loading}>
            <Table
              dataSource={upcoming}
              columns={UpcomingColumns}
              rowKey="_id"
              bordered
              pagination={{ pageSize: 100 }}
            />
          </Spin>
        </TabPane>
        <TabPane tab="Past Skills" key="past">
          <Spin spinning={loading}>
            <Table
              dataSource={past}
              columns={PastColumns}
              rowKey="_id"
              bordered
              pagination={{ pageSize: 100 }}
            />
          </Spin>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FacultyDashboard;
