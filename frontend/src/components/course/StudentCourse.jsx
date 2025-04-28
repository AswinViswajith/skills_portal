import React, { useEffect, useState } from 'react';
//import { useParams } from 'react-router-dom';
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
} from 'antd';
import axiosInstance from '../../config/axios';
import moment from 'moment';
import { Spin } from 'antd';
import { Descriptions } from "antd";
const backendUrl = import.meta.env.VITE_BACKEND_API

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
import { Modal, Input } from 'antd';
const socketUrl = import.meta.env.VITE_SOCKET_API


const { TextArea } = Input;


import io from "socket.io-client";
import { useSelector } from 'react-redux';



function StudentCourse({ skillId, skill }) {
    const [skillData, setSkillData] = useState(null);
    const [attendanceSheet, setAttendanceSheet] = useState([]);
    const [attendancePercentage, setAttendancePercentage] = useState(0);
    const [feedbacksCount, setFeedbacksCount] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [attendedSessions, setAttendedSessions] = useState(0);
    const [dates, setDates] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const socket = io(socketUrl);
    const user = useSelector((state) => state.persisted.user.user);
    const [loading, setLoading] = useState(true);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');



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

        });

        return () => socket.off("attendanceUpdated");
    }, [skillId]);


    const fetchSkillDetails = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/skillSchedule/${skillId}`);
            setSkillData(res.data);
            setFeedbacks(res.data.feedbacks.filter((f) => f.participantId.email === user.email));
            setFeedbacksCount(res.data.feedbacks.filter((f) => f.participantId.email === user.email).length);

            const allDates = res.data.attendance?.map((att) => moment(att.date).format('YYYY-MM-DD')) || [];
            const uniqueDates = [...new Set(allDates)];

            const sheet = res.data.participants.filter((participant) => participant.email === user.email).map((participant) => {
                const row = {
                    key: participant._id,
                    name: participant.name,
                    email: participant.email,
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

                    // Include "On-Duty" in attendance calculation
                    if (status === 'Present' || status === 'On-Duty') {
                        presentCount++;
                    }
                });

                row.attendancePercentage = uniqueDates.length
                    ? ((presentCount / uniqueDates.length) * 100).toFixed(0)
                    : '0';

                setTotalSessions(uniqueDates.length);
                setAttendedSessions(presentCount);
                setAttendancePercentage(row.attendancePercentage);

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

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) {
            return message.warning("Please enter your feedback.");
        }

        try {
            await axiosInstance.post(`/skillSchedule/feedback/${skillId}/add`, {
                message: feedbackText,
            });
            message.success("Feedback submitted successfully.");
            setShowFeedbackModal(false);
            setFeedbackText("");
            fetchSkillDetails(); // Re-fetch feedbacks
        } catch (err) {
            console.error(err);
            message.error("Failed to submit feedback.");
        }
    };





    const attendanceColumns = [
        { title: 'Name', dataIndex: 'name', fixed: 'left', width: 200 },
        { title: 'Email', dataIndex: 'email', fixed: 'left', width: 250 },
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
                </div>
            ),
            dataIndex: d,
            align: 'center',
            width: 150,
            render: (status) => (
                <>
                    <Tag color={
                        status === 'Present' ? 'green' :
                        status === 'On-Duty' ? 'blue' : 
                        status === 'Absent' ? 'red' : 'grey'
                    }>
                        {status}
                    </Tag>
                </>
            ),
        })),
    ];

    const feedbackColumns = [
        { title: 'Feedbacks', dataIndex: 'message' },
        {
            title: 'Date', dataIndex: 'createdAt', render: (date) => (
                <>
                    <p>{moment(date).toLocaleString()}</p>
                </>
            )
        },
    ];

    return (
        <Spin spinning={loading} size="large" tip="Loading Skill Details...">

            <div className="p-6 space-y-6">
                <Title level={2}>Skill Details - {skill?.skillName}</Title>

                <Modal
                    title="Write Feedback"
                    open={showFeedbackModal}
                    onCancel={() => {
                        setShowFeedbackModal(false);
                        setFeedbackText('');
                    }}
                    onOk={handleSubmitFeedback}
                    okText="Submit"
                    cancelText="Cancel"
                >
                    <TextArea
                        rows={5}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Type your feedback here..."
                    />
                </Modal>


                {skillData && (
                    <div className="grid grid-cols-4 gap-4">
                        <Card title="Attendance Percentage" bordered>
                            <Title level={4} style={{ color: "green" }}>
                                {attendancePercentage}
                            </Title>
                        </Card>
                        <Card title="Total Attended Session" bordered>
                            <Title level={4}>{attendedSessions}</Title>
                        </Card>
                        <Card title="Total Sessions" bordered>
                            <Title level={4} style={{ color: "red" }}>
                                {totalSessions}
                            </Title>
                        </Card>
                        <Card title="Feedback Provided" bordered>
                            <Title level={4} style={{ color: "green" }}>
                                {feedbacksCount}
                            </Title>
                        </Card>
                    </div>
                )}

                {skillData && (
                    <Descriptions
                        bordered
                        column={4}
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
                        {/* <div className="flex items-center gap-4 mb-4">
                            <DatePicker onChange={handleCreateAttendanceDate} />
                            <Button type="primary">Connect Google Sheet</Button>
                            <Button onClick={exportAttendanceToExcel} type="default">
                                Download Attendance
                            </Button>
                        </div> */}
                        <Table
                            columns={attendanceColumns}
                            dataSource={attendanceSheet}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                        />
                    </TabPane>

                    <TabPane tab="Feedback View" key="feedback">
                        <div className="flex justify-end mb-4">
                            <Button type="primary" onClick={() => setShowFeedbackModal(true)} >
                                Write Feedback
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

export default StudentCourse;