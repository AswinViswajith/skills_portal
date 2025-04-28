import React, { useEffect, useState } from "react";
import {
  Typography,
  Tabs,
  Card,
  message,
  Button,
  Empty,
  Tag,
  Tooltip
} from "antd";
import axiosInstance from "../../config/axios";
import { useSelector } from "react-redux";
import StudentCourse from "../course/StudentCourse";
import moment from "moment";

import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";


const { Title } = Typography;
const { TabPane } = Tabs;

const EmptyState = ({ message = "No skills found", subText }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    <p className="text-lg font-medium">{message}</p>
    {subText && <p className="text-sm text-gray-400">{subText}</p>}
  </div>
);

const StudentDashboard = () => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [enrolledSkills, setEnrolledSkills] = useState([]);
  const [activeTab, setActiveTab] = useState("enrolled");
  const batchYear = useSelector((state) => state.persisted.user.user.batchYear);
  const userMode = useSelector((state) => state.persisted.user.user.mode);
  const department = useSelector((state) => state.persisted.user.user.department);
  const userName = useSelector((state) => state.persisted.user.user.name);
  const [viewingSkill, setViewingSkill] = useState({});
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillCategories, setSkillCategories] = useState([]);

  // console.log(batchYear, department);

  const openCoursePage = (skill) => {
    setViewingSkill(skill);
    setShowCourseModal(true);
  };

  const closeCoursePage = () => {
    setViewingSkill(null);
    setShowCourseModal(false);
  };

  const fetchSkills = async () => {
    try {
      const [skillsData, categoriesData] = await Promise.all([
        axiosInstance.get(`/skillSchedule/fetchOpen?batchYear=${batchYear}&department=${department}`),
        axiosInstance.get("/master/skill"),
      ]);

      setAvailableSkills(skillsData.data.availableSkills || []);
      setEnrolledSkills(skillsData.data.enrolledSkills || []);
      setSkillCategories(categoriesData.data || []);
    } catch {
      message.error("Failed to fetch skills. Please try again.");
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skillsData, categoriesData] = await Promise.all([
          axiosInstance.get(`/skillSchedule/fetchOpen?batchYear=${batchYear}&department=${department}`),
          axiosInstance.get("/master/skill"),
        ]);

        setAvailableSkills(skillsData.data.availableSkills || []);
        setEnrolledSkills(skillsData.data.enrolledSkills || []);
        setSkillCategories(categoriesData.data || []);
      } catch {
        message.error("Failed to fetch skills. Please try again.");
      }
    };
    fetchSkills();
  }, []);

  const filteredAvailableSkills = availableSkills.filter((skill) => {
    const matchesQuery = skill.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? skill.EventId === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  const filteredEnrolledSkills = enrolledSkills.filter((skill) => {
    const matchesQuery = skill.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? skill.EventId === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });


  const handleEnroll = async (skillId,skill) => {
    try {
      const category = skillCategories.find((c) => c._id === skill.EventId)?.skillName;
      if(category === "Night Skill" && userMode === "Day Scholar"){
        message.error("You cannot enroll in a Night Skill as a Dayscholar.");
        return;
      }

      await axiosInstance.put(`/skillSchedule/enroll/${skillId}`);
      await fetchSkills();

      message.success("Enrolled successfully!");
    } catch (err) {
      console.log(err);
      message.error("Enrollment failed", err);
    }
  };


  
  const SkillCardOpen = ({ skill }) => {
    const category = skillCategories.find((c) => c._id === skill.EventId)?.skillName;
  
    const getActionButton = () => {
      if (skill.isRegistered) {
        return (
          <Tooltip title="You have already enrolled">
            <button className="px-4 py-1 rounded border border-green-600 text-green-600 font-medium hover:bg-green-50 transition duration-150 w-full">
              Already Enrolled
            </button>
          </Tooltip>
        );
      } else if (skill.isRegistrationUpcoming) {
        return (
          <Tooltip title="Registration not yet started">
            <button className="px-4 py-1 rounded border border-orange-500 text-orange-600 font-medium hover:bg-orange-50 transition duration-150 w-full">
              Registration Upcoming
            </button>
          </Tooltip>
        );
      } else if (skill.isExpired) {
        return (
          <Tooltip title="Registration period is over">
            <button className="px-4 py-1 rounded border border-gray-500 text-gray-600 font-medium hover:bg-gray-100 transition duration-150 w-full">
              Registration Over
            </button>
          </Tooltip>
        );
      } else {
        return (
          <Button
            type="primary"
            onClick={() => handleEnroll(skill._id,skill)}
            block
          >
            Enroll Now
          </Button>
        );
      }
    };
  
    return (
      <Card
        title={<span className="text-xl font-semibold">{skill.skillName}</span>}
        className="shadow rounded-xl border border-gray-200"
      >
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mb-2">
          {category && <Tag color="purple">{category}</Tag>}
          {skill.isCompleted && <Tag color="green">Completed</Tag>}
          {skill.isUpcoming && <Tag color="gold">Upcoming</Tag>}
          {skill.isOngoing && <Tag color="red">Ongoing</Tag>}
        </div>
  
        {/* Meta Info */}
        <p className="text-sm text-gray-600">
          <UsergroupAddOutlined className="mr-1" />
          Dept: {skill.taggedDepartment?.join(", ")} | Year: {skill.taggedYear}
        </p>
  
        <p className="text-sm text-gray-600">
          <CalendarOutlined className="mr-1" />
          Duration: {skill.skillStartTime} → {skill.skillEndTime}
        </p>
        <p className="text-sm text-gray-600">
          <CalendarOutlined className="mr-1" />
          Timings: {skill.startTime} - {skill.endTime}
        </p>
  
        <p className="text-sm text-gray-600">
          <ClockCircleOutlined className="mr-1" />
          Reg Start:{" "}
          <strong>{moment(skill.regStartTime).format("DD/MM/YYYY hh:mm A")}</strong>
        </p>
  
        <p className="text-sm text-gray-600">
          <ClockCircleOutlined className="mr-1" />
          Reg End:{" "}
          <strong>{moment(skill.regEndTime).format("DD/MM/YYYY hh:mm A")}</strong>
        </p>
  
        <p className="text-sm text-gray-600 mb-4">
          <TeamOutlined className="mr-1" />
          Participants: <strong>{skill.participants.length}</strong> / {skill.maxCount}
        </p>
  
        {getActionButton()}
      </Card>
    );
  };
  



  const SkillCard = ({ skill }) => {
    const category = skillCategories.find((c) => c._id === skill.EventId)?.skillName;

    return (
      <Card
        title={<span className="text-lg font-semibold">{skill.skillName}</span>}
        className="shadow-md rounded-xl border border-gray-200"
        extra={<div className="flex flex-wrap gap-2 mb-2">
          {skill.isCompleted && <Tag color="green">Completed</Tag>}
          {skill.isUpcoming && <Tag color="gold">Upcoming</Tag>}
          {skill.isOngoing && <Tag color="red">Ongoing</Tag>}
        </div>
        }
      >
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mb-2">
          {category && <Tag color="purple">{category}</Tag>}
        </div>

        {/* Details */}
        <div className="space-y-1 text-sm text-gray-700 mb-4">
          <p>
            <TeamOutlined className="mr-1" />
            Dept: {skill.taggedDepartment?.join(", ")} | Year: {skill.taggedYear}
          </p>
          <p>
            <CalendarOutlined className="mr-1" />
            Duration: {skill.skillStartTime} → {skill.skillEndTime}
          </p>
          <p className="t">
          <CalendarOutlined className="mr-1" />
          Timings: {moment(skill.startTime, "HH:mm").format("hh:mm A")} - {moment(skill.endTime, "HH:mm").format("hh:mm A")}
        </p>

          {/* Max Count */}

          <p>
            <TeamOutlined className="mr-1" />
            Count: {skill.participants.length} / {skill.maxCount}
          </p>
        </div>

        {/* View Button */}
        <button
          onClick={() => openCoursePage(skill)}
          className="px-4 py-1 rounded border border-green-600 text-green-600 font-medium hover:bg-green-50 transition duration-150"
        >
          View
        </button>
      </Card>
    );
  };



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
          <StudentCourse skillId={viewingSkill._id} skill={viewingSkill} onClose={closeCoursePage} />
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Total Skills Enrolled" bordered>
          <Title level={4}>{enrolledSkills.length}</Title>
        </Card>
        <Card title="Total Completed Skills" bordered>
          <Title level={4} >
            {enrolledSkills.filter((skill) => skill.isCompleted).length}
          </Title>
        </Card>
        <Card title="Total Ongoing Skills" bordered>
          <Title level={4} >
            {enrolledSkills.filter((skill) => skill.isOngoing).length}
          </Title>
        </Card>
        <Card title="Total Available Skills" bordered>
          <Title level={4} >
            {availableSkills.length}
          </Title>
        </Card>
      </div>

      <Tabs defaultActiveKey="enrolled" activeKey={activeTab} onChange={setActiveTab}>



        <TabPane tab="Enrolled Skills" key="enrolled">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by skill name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-60"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border p-2 rounded w-60"
            >
              <option value="">All Categories</option>
              {skillCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.skillName}
                </option>
              ))}
            </select>
          </div>


          {filteredEnrolledSkills.length === 0 ? (
            <EmptyState message="No Enrolled skills found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolledSkills.map((skill) => (
                <SkillCard key={skill._id} skill={skill} showEnroll={false}
                />
              ))}
            </div>
          )}
        </TabPane>

        <TabPane tab="Available Skills" key="open">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by skill name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-60"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border p-2 rounded w-60"
            >
              <option value="">All Categories</option>
              {skillCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.skillName}
                </option>
              ))}
            </select>
          </div>


          {filteredAvailableSkills.length === 0 ? (
            <EmptyState message="No available skills found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableSkills.map((skill) => (
                <SkillCardOpen key={skill._id} skill={skill} showEnroll={true} openCoursePage={openCoursePage}
                />
              ))}
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
