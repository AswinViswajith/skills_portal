import React, { useEffect, useState } from "react";
import { Table, Tabs, Tag, Button, Modal, Input, message, Descriptions } from "antd";
import axiosInstance from "../../config/axios";
import moment from "moment";
import { useSelector } from "react-redux";
const backendUrl = import.meta.env.VITE_BACKEND_API

const { TabPane } = Tabs;

function Request() {
  const [pending, setPending] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const userRole = useSelector((state) => state.persisted.user.role);

  const showDetailsModal = (skill) => {
    setSelectedSkill(skill);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedSkill(null);
  };


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/skillSchedule/requestData");
      setPending(res.data.PendingRequests);
      setPast(res.data.PastRequests);
    } catch (err) {
      message.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (id, type) => {
    setCurrentRequestId(id);
    setActionType(type);
    setIsModalVisible(true);
  };

  const handleSubmitAction = async () => {
    try {
      await axiosInstance.put(`/skillSchedule/approveOrReject/${currentRequestId}`, {
        status: actionType,
        message: popupMessage,
      });
      message.success(`${actionType} submitted successfully`);
      fetchData();
    } catch (err) {
      message.error("Failed to submit action");
    } finally {
      setIsModalVisible(false);
      setPopupMessage("");
    }
  };

  const uniqueDepartments = [...new Set(pending.flatMap(item => item.taggedDepartment))];

  const columns = [
    {
      title: "Skill Name",
      dataIndex: "skillName",
      key: "skillName",
      filterSearch: true,
      filters: [...new Set(pending.map((item) => ({ text: item.skillName, value: item.skillName })))],
      onFilter: (value, record) => record.skillName.includes(value),
    },
    {
      title: "Department",
      dataIndex: "taggedDepartment",
      key: "taggedDepartment",
      filters: uniqueDepartments.map(dep => ({ text: dep, value: dep })),
      onFilter: (value, record) => record.taggedDepartment.includes(value),
      render: (dept) => dept.join(", "),
    },
    {
      title: "Year",
      dataIndex: "taggedYear",
      filters: [...new Set(pending.map(item => ({ text: item.taggedYear, value: item.taggedYear })))],
      onFilter: (value, record) => record.taggedYear.equals(value),
      key: "taggedYear",
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
          {userRole !== "faculty" && (
            <Button type="primary" onClick={() => showModal(record._id, "Approved")}>
              Approve
            </Button>
          )}
          {userRole !== "faculty" && (
            <Button danger onClick={() => showModal(record._id, "Rejected")}>
              Reject
            </Button>
          )}
          <Button onClick={() => showDetailsModal(record)}>View Details</Button> {/* 👈 Added this */}
        </div>
      ),
    }

  ];

  const pastColumns = [
    ...columns.slice(0, columns.length - 1),
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Approved" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button onClick={() => showDetailsModal(record)}>View Details</Button> {/* 👈 Added this */}
        </div>
      ),
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Skill Requests</h2>
      <Tabs defaultActiveKey="pending">
        <TabPane tab="Pending Requests" key="pending">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={pending}
            loading={loading}
            scroll={{ x: 1000 }}
          />
        </TabPane>
        <TabPane tab="Past Requests" key="past">
          <Table
            rowKey="_id"
            columns={pastColumns}
            dataSource={past}
            loading={loading}
            scroll={{ x: 1000 }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={`${actionType} Request`}
        open={isModalVisible}
        onOk={handleSubmitAction}
        onCancel={() => setIsModalVisible(false)}
        okText="Submit"
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter your message..."
          value={popupMessage}
          onChange={(e) => setPopupMessage(e.target.value)}
        />
      </Modal><Modal
        open={isDetailsModalOpen}
        onCancel={handleDetailsModalClose}
        footer={null}
        width={1000}
      >
        {selectedSkill && (
          <Descriptions
            bordered
            column={4}
            title="Skill Information"
            size="middle"
            layout="vertical"
          >
            <Descriptions.Item label="Skill Name">{selectedSkill.skillName}</Descriptions.Item>
            <Descriptions.Item label="Organiser">{selectedSkill.organiser}</Descriptions.Item>
            <Descriptions.Item label="Tagged Department">
              {selectedSkill.taggedDepartment?.join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Budget">₹ {selectedSkill.budget}</Descriptions.Item>
            <Descriptions.Item label="Tagged Year">{selectedSkill.taggedYear}</Descriptions.Item>
            <Descriptions.Item label="Venues">
              {selectedSkill.venueName.join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Max Count">{selectedSkill.maxCount}</Descriptions.Item>
            <Descriptions.Item label="Total Days">{selectedSkill.totalDays}</Descriptions.Item>
            <Descriptions.Item label="Skill Start Date">{selectedSkill.skillStartTime}</Descriptions.Item>
            <Descriptions.Item label="Skill End Date">{selectedSkill.skillEndTime}</Descriptions.Item>
            <Descriptions.Item label="Daily Start Time">{selectedSkill.startTime}</Descriptions.Item>
            <Descriptions.Item label="Daily End Time">{selectedSkill.endTime}</Descriptions.Item>
            <Descriptions.Item label="Registration Start">
              {moment(selectedSkill.regStartTime).utc().format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label="Registration End">
              {moment(selectedSkill.regEndTime).utc().format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label="Description">{selectedSkill.description}</Descriptions.Item>
            {selectedSkill.acknowledgedDoc.map((doc) => (
              <Descriptions.Item label="Acknowledged Docs">
                <a href={`${backendUrl}` + doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              </Descriptions.Item>
            ))}

          </Descriptions>
        )}
      </Modal>



    </div>
  );
}

export default Request;
