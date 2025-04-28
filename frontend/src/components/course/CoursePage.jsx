import React, { useEffect, useRef, useState } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Table,
  DatePicker,
  Button,
  message,
  Select,
  Popconfirm,
  Tag,
  Input,
  Space,
} from 'antd';
import axiosInstance from '../../config/axios';
import moment from 'moment';
import { Spin } from 'antd';
import { Descriptions } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DownloadOutlined,SearchOutlined } from '@ant-design/icons';
const socketUrl = import.meta.env.VITE_SOCKET_API
const backendUrl = import.meta.env.VITE_BACKEND_API

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
import io from "socket.io-client";
import { useSelector } from 'react-redux';


const useTableSearch = () => {
  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  return { getColumnSearchProps };
};


function CoursePage({ skillId, skill }) {
  const [skillData, setSkillData] = useState(null);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [dates, setDates] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const socket = io(socketUrl);
  const user = useSelector((state) => state.persisted.user.user);
  const [loading, setLoading] = useState(true);
  const { getColumnSearchProps } = useTableSearch(); 





  useEffect(() => {
    fetchSkillDetails();
  }, []);

  useEffect(() => {
    socket.on("attendanceUpdated", ({ skillId: sId, participantId, date, status }) => {
      if (sId !== skillId) return;

      // Optimistic update for all clients
      setAttendanceSheet((prevSheet) =>
        prevSheet.map((row) =>
          row.key === participantId
            ? { ...row, [date]: status }
            : row
        )
      );

      //   message.info(`Marked ${status} by ${updatedBy}`);
    });

    return () => socket.off("attendanceUpdated");
  }, [skillId]);


  const fetchSkillDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/skillSchedule/${skillId}`);
      setSkillData(res.data);
      setFeedbacks(res.data.feedbacks);

      const allDates = res.data.attendance?.map((att) => moment(att.date).format('YYYY-MM-DD')) || [];
      const uniqueDates = [...new Set(allDates)];

      const sheet = res.data.participants.map((participant) => {
        const row = {
          key: participant._id,
          name: participant.name,
          email: participant.email,
          collegeId: participant.collegeId
        };

        let presentCount = 0;
        uniqueDates.forEach((date) => {
          const dayAttendance = res.data.attendance.find(
            (a) => moment(a.date).format('YYYY-MM-DD') === date
          );
          const statusEntry = dayAttendance?.participants.find(
            (p) => p.participantId === participant._id
          );
          const status = statusEntry?.status || 'Pending';
          row[date] = status;

          if (status === 'Present' || status === 'On-Duty') presentCount++;
        });

        row.attendancePercentage = uniqueDates.length
          ? ((presentCount / uniqueDates.length) * 100).toFixed(0)
          : '0';

        return row;
      });


      setAttendanceSheet(sheet);
      setDates(uniqueDates);
    } catch {
      message.error('Failed to fetch course data');
    }
    finally {
      setLoading(false);
    }
  };

  const handleCreateAttendanceDate = async (date) => {
    const formatted = date.format('YYYY-MM-DD');
    if (dates.includes(formatted)) {
      return message.warning('Attendance for this date already exists');
    }
    try {
      await axiosInstance.post(`/skillSchedule/attendance/${skillId}/create`, {
        date: formatted,
      });
      message.success('Attendance date added');
      fetchSkillDetails();
    } catch {
      message.error('Failed to create attendance date');
    }
  };

  const handleDeleteDate = async (date) => {
    try {
      await axiosInstance.delete(`/skillSchedule/attendance/${skillId}/delete?date=${date}`);
      message.success('Attendance date removed');
      fetchSkillDetails();
    } catch {
      message.error('Failed to delete attendance date');
    }
  };

  const handleStatusChange = (participantId, date, newStatus) => {
    socket.emit("updateAttendance", {
      skillId,
      participantId,
      date,
      status: newStatus,
      updatedBy: user?.name || user?.email || "Someone",
    });

    setAttendanceSheet((prevSheet) =>
      prevSheet.map((row) => {
        if (row.key === participantId) {
          const updatedRow = { ...row, [date]: newStatus };

          // 👇 Recalculate attendance % locally
          let presentCount = 0;
          dates.forEach((d) => {
            const status = updatedRow[d] || "Pending";
            if (status === "Present" || status === "On-Duty") presentCount++;
          });

          updatedRow.attendancePercentage = dates.length
            ? ((presentCount / dates.length) * 100).toFixed(0)
            : "0";

          return updatedRow;
        }
        return row;
      })
    );
  };


  const exportAttendanceToExcel = () => {
    const exportData = attendanceSheet.map((row) => {
      const { name, email, ...attendance } = row;
      return {
        Name: name,
        Email: email,
        ...attendance,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Attendance_${skillData?.skillName || "Skill"}.xlsx`);
  };

  const exportFeedbackToExcel = () => {
    const exportData = feedbacks.map((f) => ({
      Email: f.participantId.email,
      Roll: f.participantId.collegeId,
      Message: f.message,
      Status: f.isRead ? "Read" : "Unread",
      Date: moment(f.createdAt).format("YYYY-MM-DD HH:mm"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Feedback_${skillData?.skillName || "Skill"}.xlsx`);
  };

  const handleMarkAsRead = async (skillId, feedbackId) => {
    try {
      // Make your API call here to update feedback status
      await axiosInstance.put(`/skillSchedule/feedback/${skillId}/${feedbackId}/mark-read`);
      // Then refetch or update the table data
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };



  const attendanceColumns = [
    {
      title: 'Roll',
      dataIndex: 'collegeId',
      fixed: 'left',
      width: 250,
      ...getColumnSearchProps('collegeId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      width: 200,
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      fixed: 'left',
      width: 250,
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Attendance %',
      dataIndex: 'attendancePercentage',
      width: 150,
      align: 'center',
      render: (text) => (
        <span className="font-semibold text-blue-600">{text}%</span>
      ),
    },
    ...dates.map((d) => ({
      title: (
        <div className="flex flex-row items-center justify-center">
          <span className="text-center">{moment(d).format('DD MMM')}</span>
          <Popconfirm
            title="Delete this date?"
            onConfirm={() => handleDeleteDate(d)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" type="link" danger>
              x
            </Button>
          </Popconfirm>
        </div>
      ),
      dataIndex: d,
      align: 'center',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.key, d, value)}
          style={{ width: 120 }}
        >
          <Option value="Present">
            <span className="text-green-600">Present</span>
          </Option>
          <Option value="On-Duty">
            <span className="text-blue-600">On-Duty</span>
          </Option>
          <Option value="Absent">
            <span className="text-red-600">Absent</span>
          </Option>
          <Option value="Pending">Pending</Option>
        </Select>
      ),
    })),
  ];


  const feedbackColumns = [
    { title: 'Participant Email', dataIndex: ['participantId', 'email'] },
    { title: 'Participant Roll', dataIndex: ['participantId', 'collegeId'] },
    { title: 'Message', dataIndex: 'message' },
    { title: 'Date', dataIndex: 'createdAt' },
    {
      title: 'Status',
      render: (text, record) =>
        record.isRead ? (
          <Tag color="green">Read</Tag>
        ) : (
          <Button type="primary" size="small" onClick={() => handleMarkAsRead(skillId, record._id)}>
            Mark Read
          </Button>
        ),
    },
  ];

  return (
    <Spin spinning={loading} size="large" tip="Loading Skill Details...">

      <div className="p-6 space-y-6">
        <Title level={2}>Skill Details - {skill?.skillName}</Title>

        {skillData && (
          <div className="grid grid-cols-3 gap-4">
            <Card title="Total Enrollments">
              <Title level={4}>{skillData.participants?.length || 0}</Title>
            </Card>
            <Card title="Feedbacks Received">
              <Title level={4}>{skillData.feedbacks?.length || 0}</Title>
            </Card>
            <Card title="Total Sessions">
              <Title level={4}>{skillData.attendance?.length || 0}</Title>
            </Card>
          </div>
        )}

        {skillData && (
          <Descriptions
            bordered
            column={5}
            title="Skill Information"
            size="middle"
            layout="vertical"
          >
            <Descriptions.Item label="Skill Name">{skillData.skillName}</Descriptions.Item>
            <Descriptions.Item label="Organiser">{skillData.organiser}</Descriptions.Item>
            <Descriptions.Item label="Tagged Department">
              {skillData.taggedDepartment?.join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Tagged Year">{skillData.taggedYear}</Descriptions.Item>
            <Descriptions.Item label="Venues">
                {skillData.venueName.join(", ")}
              </Descriptions.Item>
            <Descriptions.Item label="Budget">₹ {skillData.budget}</Descriptions.Item>
            <Descriptions.Item label="Max Count">{skillData.maxCount}</Descriptions.Item>
            <Descriptions.Item label="Total Days">{skillData.totalDays}</Descriptions.Item>
            <Descriptions.Item label="Skill Start Date">{skillData.skillStartTime}</Descriptions.Item>
            <Descriptions.Item label="Skill End Date">{skillData.skillEndTime}</Descriptions.Item>
            <Descriptions.Item label="Daily Start Time">{skillData.startTime}</Descriptions.Item>
            <Descriptions.Item label="Daily End Time">{skillData.endTime}</Descriptions.Item>
            <Descriptions.Item label="Registration Start">
              {moment(skillData.regStartTime).utc().format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label="Registration End">
              {moment(skillData.regEndTime).utc().format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{skillData.status}</Descriptions.Item>
            {skillData.message && (
              <Descriptions.Item label="Admin Message">
                {skillData.message}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Description">
              {skillData.description}
            </Descriptions.Item>
            {skillData.acknowledgedDoc.map((doc) => (
              <Descriptions.Item label="Acknowledged Docs">
                <a href={`${backendUrl}` + doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              </Descriptions.Item>
            ))}
             
          
          </Descriptions>
        )}

        <Tabs className="mt-6">
          <TabPane tab="Attendance View" key="attendance">
            <div className="flex items-center gap-4 mb-4">
              <DatePicker onChange={handleCreateAttendanceDate} />
              <Button type="primary">Connect Google Sheet</Button>
              <Button onClick={exportAttendanceToExcel} type="default">
                Download Attendance
              </Button>
            </div>
            <Table
              columns={attendanceColumns}
              dataSource={attendanceSheet}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </TabPane>

          <TabPane tab="Feedback View" key="feedback">
            <div className="flex mb-4">
              <Button type="primary" onClick={exportFeedbackToExcel} >
                Download Feedback
              </Button>
            </div>
            <Table
              columns={feedbackColumns}
              dataSource={feedbacks}
              rowKey="participantId"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  );
}

export default CoursePage;
