/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Spin,
  Tabs,
  message,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import axiosInstance from "../../config/axios";

const { TabPane } = Tabs;

const MasterDataPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [category, setCategory] = useState([]);
  const [skill, setSkill] = useState([]);
  const [venue, setVenue] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState([]);
  const [filteredSkill, setFilteredSkill] = useState([]);
  const [filteredVenue, setFilteredVenue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("users");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        usersResponse,
        departmentResponse,
        categoryResponse,
        batchResponse,
        skillResponse,
        venueResponse
      ] = await Promise.all([
        axiosInstance.get("/master"),
        axiosInstance.get("/master/departments"),
        axiosInstance.get("/master/category"),
        axiosInstance.get("/master/batch"),
        axiosInstance.get("/master/skill"),
        axiosInstance.get("/master/venue")
      ]);

      setUsers(usersResponse.data);
      setDepartments(departmentResponse.data);
      setCategory(categoryResponse.data);
      setBatches(batchResponse.data);
      setFilteredUsers(usersResponse.data);
      setFilteredDepartments(departmentResponse.data);
      setFilteredBatches(batchResponse.data);
      setFilteredCategory(categoryResponse.data);
      setSkill(skillResponse.data);
      setFilteredSkill(skillResponse.data);
      setVenue(venueResponse.data);
      setFilteredVenue(venueResponse.data);
    } catch (error) {
      message.error(
        `Failed to fetch data. ${
          error.response?.data?.message || "An error occurred."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    if (currentTab === "users") {
      setFilteredUsers(
        users.filter((user) =>
          Object.values(user).join(" ").toLowerCase().includes(value)
        )
      );
    } else if (currentTab === "category") {
      setFilteredCategory(
        category.filter((cat) => cat.categoryName.toLowerCase().includes(value))
      );
    } else if (currentTab === "departments") {
      setFilteredDepartments(
        departments.filter((dep) =>
          dep.departmentName.toLowerCase().includes(value)
        )
      );
    } 
    else if (currentTab === "skills") {
      setFilteredSkill(
        skill.filter((sk) =>
          sk.skillName.toLowerCase().includes(value)
        )
      );
    } 
    else if (currentTab === "venue") {
      setFilteredVenue(
        venue.filter((dep) =>
          dep.venueName.toLowerCase().includes(value)
        )
      );
    } 
    else {
      setFilteredBatches(
        batches.filter((batch) => batch.batchName.toLowerCase().includes(value))
      );
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingRecord(null);

    if (currentTab === "departments") {
      form.setFieldsValue({ email: "" });
    } else if (currentTab === "category") {
      form.setFieldsValue({ email: "" });
    } else {
      form.setFieldsValue({
        collegeId: "",
        name: "",
        email: "",
        department: "",
        userType: "",
        batch: "",
        mode: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsModalOpen(false);
  };

  const handleSave = async (values) => {
    try {
      if (currentTab === "users") {
        if (editingRecord) {
          await axiosInstance.put(`/master/${editingRecord._id}`, values);
          message.success("User updated successfully.");
        } else {
          await axiosInstance.post("/master", values);
          message.success("User added successfully.");
        }
      } else if (currentTab === "category") {
        if (editingRecord) {
          await axiosInstance.put(
            `/master/category/${editingRecord._id}`,
            values
          );
          message.success("Category updated successfully.");
        } else {
          await axiosInstance.post("/master/category", values);
          message.success("Category added successfully.");
        }
      } else if (currentTab === "departments") {
        if (editingRecord) {
          await axiosInstance.put(
            `/master/departments/${editingRecord._id}`,
            values
          );
          message.success("Department updated successfully.");
        } else {
          await axiosInstance.post("/master/departments", values);
          message.success("Department added successfully.");
        }
      }
      else if (currentTab === "skills") {
        if (editingRecord) {
          await axiosInstance.put(
            `/master/skill/${editingRecord._id}`,
            values
          );
          message.success("Skill updated successfully.");
        } else {
          await axiosInstance.post("/master/Skill", values);
          message.success("Skill added successfully.");
        }
      }
      else if (currentTab === "venue") {
        if (editingRecord) {
          await axiosInstance.put(
            `/master/venue/${editingRecord._id}`,
            values
          );
          message.success("Venue updated successfully.");
        } else {
          await axiosInstance.post("/master/venue", values);
          message.success(" Venue added successfully.");
        }
      }
      else {
        if (editingRecord) {
          await axiosInstance.put(`/master/batch/${editingRecord._id}`, values);
          message.success("Batch updated successfully.");
        } else {
          await axiosInstance.post("/master/batch", values);
          message.success("Batch added successfully.");
        }
      }
      fetchAllData();
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        `Failed to save data. ${
          error.response?.data?.message || "An error occurred."
        }`
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      if (currentTab === "users") {
        await axiosInstance.delete(`/master/${id}`);
        message.success("User deleted successfully.");
      } else if (currentTab === "category") {
        await axiosInstance.delete(`/master/category/${id}`);
        message.success("Category deleted successfully.");
      } else if (currentTab === "departments") {
        await axiosInstance.delete(`/master/departments/${id}`);
        message.success("Department deleted successfully.");
      }
      else if (currentTab === "skills") {
        await axiosInstance.delete(`/master/skill/${id}`);
        message.success("Skill deleted successfully")
      }
      else if (currentTab === "venue") {
        await axiosInstance.delete(`/master/venue/${id}`);
        message.success("Venue deleted successfully")
      }
      else {
        await axiosInstance.delete(`/master/batch/${id}`);
        message.success("Batch deleted successfully.");
      }
      fetchAllData();
    } catch (error) {
      message.error(
        `Failed to delete. ${
          error.response?.data?.message || "An error occurred."
        }`
      );
    }
  };

  const handleUploadCSV = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    var response;
    try {
      if (currentTab === "users") {
        response = await axiosInstance.post("/master/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Users uploaded successfully.");
      } else if (currentTab === "category") {
        response = await axiosInstance.post(
          "/master/category/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        message.success("Category uploaded successfully.");
      } else if (currentTab === "departments") {
        response = await axiosInstance.post(
          "/master/departments/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        message.success("Departments uploaded successfully.");
      } 
      else if (currentTab === "skills") {
        response = await axiosInstance.post(
          "/master/skills/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        message.success("General Duty uploaded successfully.");
      } 
      else if (currentTab === "venue") {
        response = await axiosInstance.post(
          "/master/venue/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        message.success("Venue uploaded successfully.");
      } 
      
      else {
        response = await axiosInstance.post("/master/batch/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Batch uploaded successfully.");
      }

      fetchAllData();
    } catch (error) {
      message.error(
        `Failed to upload CSV. ${
          error.response.data?.errors || "An error occurred."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const data =
      currentTab === "users"
        ? filteredUsers.map(
            ({
              collegeId,
              name,
              email,
              department,
              userType,
              createdAt,
              batchYear,
              mode

            }) => ({
              collegeId,
              name,
              email,
              department: department || "N/A",
              userType,
              createdAt,
              batchYear,
              mode
            })
          )
        : currentTab === "category"
        ? filteredCategory.map(({ categoryName }) => ({ categoryName }))
        : currentTab === "departments"
        ? filteredDepartments.map(({ departmentName }) => ({ departmentName }))
        : currentTab === "skills"
        ? filteredSkill.map(({ skillName }) => ({ skillName }))
        : currentTab === "venue"
        ? filteredVenue.map(({ venueName, capacity }) => ({ venueName, capacity }))
        : filteredBatches.map(({ batchName }) => ({ batchName }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      currentTab === "users"
        ? "Users"
        : currentTab === "category"
        ? "Category"
        : currentTab === "departments"
        ? "Departments" : currentTab === "skills"
        ? "Skills" : currentTab === "venue"
        ? "Venue"
        : "Batch"
    );
    XLSX.writeFile(
      workbook,
      currentTab === "users"
        ? "Users_data.csv"
        : currentTab === "category"
        ? "Category_data.csv"
        : currentTab === "departments"
        ? "Departments_data.csv": currentTab === "skills"
        ? "Skills_data.csv" : currentTab === "venue"
        ? "Venue_data.csv" : "Batch_data.csv"
    );
  };

  const userColumns = [
    { title: "ID", dataIndex: "collegeId", key: "collegeId",fixed:"left" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mode", dataIndex: "mode", key: "mode" },
    { title: "Batch Year", dataIndex: "batchYear", key: "batchYear" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Role", dataIndex: "userType", key: "userType" },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const departmentColumns = [
    { title: "Department", dataIndex: "departmentName", key: "departmentName" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const batchColumns = [
    { title: "Batch", dataIndex: "batchYear", key: "batchYear" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const venueColumns = [
    { title: "Venue Name", dataIndex: "venueName", key: "venueName" },
    { title: "Seat Capacity", dataIndex: "capacity", key: "seatCapacity" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const skillColumns = [
    { title: "Skill Name", dataIndex: "skillName", key: "skillName" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Master Data</h1>
        <Tabs defaultActiveKey="users" onChange={(key) => setCurrentTab(key)}>
          <TabPane tab="Users" key="users">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Users..."
                prefix={<SearchOutlined />}
                style={{ width: 300, marginBottom: 16 }}
                onChange={handleSearch}
              />
              <div className="mb-4 flex justify-between">
                <div>
                  <Button
                    type="primary"
                    className="mr-2"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Add User
                  </Button>

                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCSV}
                    className="mr-2"
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() =>
                      document.getElementById("uploadInput").click()
                    }
                  >
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    id="uploadInput"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadCSV(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <Spin spinning={loading}>
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={userColumns}
                  dataSource={filteredUsers.map((user) => ({
                    ...user,
                    key: user._id,
                  }))}
                  pagination={{ pageSize: 25 }}
                  bordered
                  scroll={{ x: "max-content" }} // ✅ Enables horizontal scroll
                />
              </div>
            </Spin>
          </TabPane>

          <TabPane tab="Departments" key="departments">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Departments..."
                prefix={<SearchOutlined />}
                style={{ width: 300, marginBottom: 16 }}
                onChange={handleSearch}
              />
              <div className="mb-4 flex justify-between">
                <div>
                  <Button
                    className="mr-2"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Add Department
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCSV}
                    className="mr-2"
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() =>
                      document.getElementById("uploadInputEmails").click()
                    }
                  >
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    id="uploadInputEmails"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadCSV(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={departmentColumns}
                dataSource={filteredDepartments.map((department) => ({
                  ...department,
                  key: department._id,
                }))}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </Spin>
          </TabPane>

          <TabPane tab="Batches" key="batches">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Batch..."
                prefix={<SearchOutlined />}
                style={{ width: 300, marginBottom: 16 }}
                onChange={handleSearch}
              />
              <div className="mb-4 flex justify-between">
                <div>
                  <Button
                    className="mr-2"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Add Batch
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCSV}
                    className="mr-2"
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() =>
                      document.getElementById("uploadInputEmails").click()
                    }
                  >
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    id="uploadInputEmails"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadCSV(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={batchColumns}
                dataSource={filteredBatches.map((batches) => ({
                  ...batches,
                  key: batches._id,
                }))}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </Spin>
          </TabPane>

          <TabPane tab="Venues" key="venue">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Venue..."
                prefix={<SearchOutlined />}
                style={{ width: 300, marginBottom: 16 }}
                onChange={handleSearch}
              />
              <div className="mb-4 flex justify-between">
                <div>
                  <Button
                    className="mr-2"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Add Venue
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCSV}
                    className="mr-2"
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() =>
                      document.getElementById("uploadInputEmails").click()
                    }
                  >
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    id="uploadInputEmails"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadCSV(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={venueColumns}
                dataSource={filteredVenue.map((batches) => ({
                  ...batches,
                  key: batches._id,
                }))}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </Spin>
          </TabPane>

          <TabPane tab="Skills" key="skills">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Skill..."
                prefix={<SearchOutlined />}
                style={{ width: 300, marginBottom: 16 }}
                onChange={handleSearch}
              />
              <div className="mb-4 flex justify-between">
                <div>
                  <Button
                    className="mr-2"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Add Skill
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCSV}
                    className="mr-2"
                  >
                    Download CSV
                  </Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() =>
                      document.getElementById("uploadInputEmails").click()
                    }
                  >
                    Upload CSV
                  </Button>
                  <input
                    type="file"
                    id="uploadInputEmails"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleUploadCSV(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={skillColumns}
                dataSource={filteredSkill.map((sk) => ({
                  ...sk,
                  key: sk._id,
                }))}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </Spin>
          </TabPane>
        </Tabs>
        <Modal
          title={
            editingRecord
              ? currentTab === "users"
                ? "Edit User"
                : currentTab === "category"
                ? "Edit Category"
                : currentTab === "departments"
                ? "Edit Department"
                : "Edit Batch"
              : currentTab === "users"
              ? "Add User"
              : currentTab === "category"
              ? "Add Category"
              : currentTab === "departments"
              ? "Add Department" : currentTab === "skills"
              ? "Add Skill" : currentTab === "venue"
              ? "Add Venue" : "Add Batch"
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
        >
          <Form form={form} onFinish={handleSave} layout="vertical">
            {currentTab === "users" ? (
              <>
                <Form.Item
                  name="collegeId"
                  label="College ID"
                  rules={[
                    { required: true, message: "Please input the College ID!" },
                  ]}
                >
                  <Input placeholder="Enter College ID" />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    { required: true, message: "Please input the name!" },
                  ]}
                >
                  <Input placeholder="Enter Name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please input the email!" },
                  ]}
                >
                  <Input placeholder="Enter Email" />
                </Form.Item>

                <Form.Item name="mode" label="Mode">
                  <Select placeholder="Select Mode">
                    <Select.Option value="Day Scholar">Day Scholar</Select.Option>
                    <Select.Option value="Hosteller">Hosteller</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="department"
                  label="Department"
                  rules={[
                    { required: true, message: "Please select a department!" },
                  ]}
                >
                  <Select placeholder="Select Department">
                    {departments.map((department) => (
                      <Select.Option
                        key={department._id}
                        value={department.departmentName}
                      >
                        {department.departmentName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="batchYear" label="Batch">
                  <Select placeholder="Select Batch">
                    {batches.map((batch) => (
                      <Select.Option key={batch._id} value={batch.batchYear}>
                        {batch.batchYear}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="userType"
                  label="User Role"
                  rules={[{ required: true, message: "Please select a role!" }]}
                >
                  <Select placeholder="Select Role">
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="faculty">Faculty</Select.Option>
                    <Select.Option value="student">Student</Select.Option>
                  </Select>
                </Form.Item>
                {/* <Form.Item name="parentEmail" label="Parent Email">
                  <Input placeholder="Enter Parent Email" />
                </Form.Item> */}
              </>
            ) : currentTab === "category" ? (
              <Form.Item
                name="categoryName"
                label="Category"
                rules={[
                  { required: true, message: "Please input the category!" },
                ]}
              >
                <Input placeholder="Enter Category" />
              </Form.Item>
            ) : currentTab === "departments" ? (
              <Form.Item
                name="departmentName"
                label="Department"
                rules={[
                  { required: true, message: "Please input the department!" },
                ]}
              >
                <Input placeholder="Enter Department" />
              </Form.Item>
            ) : currentTab === "venue" ? (
              <>
              <Form.Item
              name="venueName"
              label="Venue Name"
              rules={[
                { required: true, message: "Please input the venue name!" },
              ]}
            >
              <Input placeholder="Enter Venue Name" />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[
                { required: true, message: "Please input the capacity!" },
              ]}
            >
              <Input placeholder="Enter Capacity" />
            </Form.Item>
            </>
            ) : currentTab === "batches" ? (
              <Form.Item
                name="batchYear"
                label="Batch Year"
                rules={[{ required: true, message: "Please input the batch!" }]}
              >
                <Input placeholder="Enter Batch" />
              </Form.Item>
            ):(
              <Form.Item
                name="skillName"
                label="Skill Name"
                rules={[
                  { required: true, message: "Please input the skill!" },
                ]}
              >
                <Input placeholder="Enter Skill" />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "Save Changes" : "Add"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MasterDataPage;
