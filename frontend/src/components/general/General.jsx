import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Select,
  Button,
  Modal,
  DatePicker,
  Input,
  message,
  Spin,
  Form,
} from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  QrcodeOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import papa from "papaparse";
import moment from "moment";
import axiosInstance from "../../config/axios";
import { useSelector } from "react-redux";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function General() {
  const [duties, setDuties] = useState([]);
  const userRole = useSelector((state) => state.persisted.user.role);
  const [filteredDuties, setFilteredDuties] = useState([]);
  const [venues, setVenues] = useState([]);
  const [dutyTypes, setDutyTypes] = useState([]);
  const [selectedDutyType, setSelectedDutyType] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("today");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [venueList, setVenueList] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [form] = Form.useForm();

  const statusMap = {
    open: "Open",
    closed: "Closed",
  };

  /** 📌 Fetch Duty Types (Dropdown) */
  useEffect(() => {
    fetchDutyTypes();
    if (userRole === "faculty") {
      fetchDutiesForFaculty();
    }
  }, []);

  const fetchDutiesForFaculty = async () => {
    setLoading(true);
    console.log("Selected Duty Type:", selectedDutyType);
    try {
      const { data } = await axiosInstance.post(`/gdSchedule/faculty`);
      setDuties(data);
      setFilteredDuties(data);
      message.success("Duties fetched successfully.");
      const allVenues = data.flatMap((duty) => duty.venue);
      console.log("All Venues:", allVenues);
      const uniqueVenues = Array.from(
        new Map(allVenues.map((v) => [v.venueId, v])).values()
      );
      console.log("Unique Venues:", uniqueVenues);
      setVenues(uniqueVenues);
    } catch (error) {
      console.error("Error fetching duties:", error);
      message.error("Error fetching duties.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDutyTypes = async () => {
    try {
      const { data } = await axiosInstance.get("/master/generalDuty");
      setDutyTypes(data);
    } catch (error) {
      console.error("Error fetching duty types:", error);
      message.error("Error fetching duty types.");
    }
  };

  /** 📌 Fetch Duty List */
  useEffect(() => {
    if (selectedDutyType.dutyName) {
      fetchDuties();
    }
  }, [selectedDutyType]);

  const fetchDuties = async () => {
    setLoading(true);
    console.log("Selected Duty Type:", selectedDutyType);
    try {
      const { data } = await axiosInstance.get(
        `/gdSchedule/list?dutyID=${selectedDutyType._id}`
      );
      setDuties(data);
      setFilteredDuties(data);
      message.success("Duties fetched successfully.");
      const allVenues = data.flatMap((duty) => duty.venue);
      console.log("All Venues:", allVenues);
      const uniqueVenues = Array.from(
        new Map(allVenues.map((v) => [v.venueId, v])).values()
      );
      console.log("Unique Venues:", uniqueVenues);
      setVenues(uniqueVenues);
    } catch (error) {
      console.error("Error fetching duties:", error);
      message.error("Error fetching duties.");
    } finally {
      setLoading(false);
    }
  };

  /** 📌 Handle Filters */
  const handleDateFilterChange = (value) => {
    setSelectedFilter(value);
    filterDuties(value);
  };

  const filterDuties = (filterType) => {
    const today = moment().utc().startOf("day"); // Convert to UTC
    const weekStart = moment().utc().startOf("week");
    const weekEnd = moment().utc().endOf("week");
    const monthStart = moment().utc().startOf("month");
    const monthEnd = moment().utc().endOf("month");

    console.log("Today (UTC):", today.format());
    console.log("Week Start (UTC):", weekStart.format());
    console.log("Week End (UTC):", weekEnd.format());
    console.log("Month Start (UTC):", monthStart.format());
    console.log("Month End (UTC):", monthEnd.format());

    let filtered = duties;

    switch (filterType) {
      case "today":
        filtered = duties.filter((duty) =>
          moment.utc(duty.startTime).isSame(today, "day")
        );
        break;
      case "week":
        filtered = duties.filter((duty) =>
          moment.utc(duty.startTime).isBetween(weekStart, weekEnd, "day", "[]")
        );
        break;
      case "month":
        filtered = duties.filter((duty) =>
          moment
            .utc(duty.startTime)
            .isBetween(monthStart, monthEnd, "day", "[]")
        );
        break;
      default:
        filtered = duties;
    }

    setFilteredDuties(filtered);
  };

  /** 📌 Handle Custom Date Selection */
  const handleCustomDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;

    console.log("Selected Dates:", dates);

    // Convert Day.js objects to Moment.js-compatible Date objects
    const startDate = moment(dates[0].toDate()).utc().startOf("day");
    const endDate = moment(dates[1].toDate()).utc().endOf("day");

    console.log("Custom Range Start (UTC):", startDate.format());
    console.log("Custom Range End (UTC):", endDate.format());

    const filtered = duties.filter((duty) =>
      moment.utc(duty.startTime).isBetween(startDate, endDate, "day", "[]")
    );

    setFilteredDuties(filtered);
  };

  const handleVenueFilterChange = (selectedVenueId) => {
    if (!selectedVenueId) {
      setFilteredDuties(duties);
      return;
    }

    const filtered = duties.filter((duty) =>
      duty.venue.some((venue) => venue.venueId === selectedVenueId)
    );

    setFilteredDuties(filtered);
  };

  /** 📌 Handle Create Duty Modal */
  const handleCreateOrEditDuty = async (values) => {
    try {
      console.log(values);
      setLoading(true);

      const start = moment(startTime);
      const end = moment(endTime);
      console.log("Start Time:", start);
      console.log("End Time:", end);

      if (!startTime || !endTime) {
        message.error("Please select both start and end time.");
        return;
      }

      if (!start.isSame(end, "day")) {
        message.error("Start time and End time must be on the same day.");
        return;
      }

      if (end.isBefore(start)) {
        message.error("End time must be greater than Start time.");
        return;
      }

      if (!venues || venues.length === 0) {
        message.error("Please select at least one venue");
        return;
      }

      const updatedVenue = selectedVenue.map((venue) => {
        venue.venueId = venue._id;
      });
      setSelectedVenue(updatedVenue);
      var data = {
        startTime: startTime,
        endTime: endTime,
        venue: selectedVenue,
        faculty: selectedFaculty,
        description: values.description,
        dutyName: selectedDutyType.dutyName,
        GDid: selectedDutyType._id,
      };
      if (editingDuty) {
        await axiosInstance.put(`/gdSchedule/edit/${editingDuty._id}`, data);
        message.success("Duty Updated Successfully!");
      } else {
        await axiosInstance.post("/gdSchedule/create", data);
        message.success("Duty Created Successfully!");
      }
      setIsModalOpen(false);
      fetchDuties();
      form.resetFields();
    } catch (error) {
      message.error("Error saving duty.");
    } finally {
      setLoading(false);
    }
  };

  /** 📌 Fetch Faculty */
  const fetchFaculty = async () => {
    if (!startTime && !endTime) {
      message.warning("Please select Start & End Time first.");
      return;
    }

    const start = moment(startTime);
    const end = moment(endTime);
    console.log("Start Time:", start);
    console.log("End Time:", end);

    if (!startTime || !endTime) {
      message.error("Please select both start and end time.");
      return;
    }

    if (!start.isSame(end, "day")) {
      message.error("Start time and End time must be on the same day.");
      return;
    }

    if (end.isBefore(start)) {
      message.error("End time must be greater than Start time.");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/gdSchedule/available", {
        startTime: startTime,
        endTime: endTime,
        dutyId: selectedDutyType._id,
      });
      setFacultyList(data.availableFaculties);
      setVenueList(data.availableVenues);

      message.success("Faculty & Venue list updated.");
    } catch (error) {
      console.error("Error fetching faculty & venues:", error);
      message.error("Error fetching faculty & venues");
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingDuty) return;
    try {
      await axiosInstance.delete(`/gdSchedule/delete/${editingDuty._id}`);
      message.success("Event deleted successfully.");
      fetchDuties();
      setIsModalOpen(false);
    } catch (error) {
      message.error("Failed to delete the event.");
    }
  };

  const handleStatusChange = async (newStatus, record) => {
    const previousStatus = record.status; // Store the previous status in case of failure

    try {
      // 🔹 Update status optimistically
      record.status = newStatus;
      setFilteredDuties([...filteredDuties]);

      // 🔹 Call the backend to update the status
      await axiosInstance.patch(`/gdSchedule/status/${record._id}`, {
        status: newStatus,
      });

      // 🔹 Show success message
      message.success(`Status updated to ${statusMap[newStatus]}`);
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status.");

      // 🔹 Restore previous status on failure
      record.status = previousStatus;
      setFilteredDuties([...filteredDuties]);
    }
  };

  /** 📌 Table Columns */
  const columns = [
    {
      title: "Duty",
      dataIndex: "dutyName",
      key: "dutyName",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (time) => moment.utc(time).format("DD/MM/YYYY hh:mm A"),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (time) => moment.utc(time).format("DD/MM/YYYY hh:mm A"),
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
      render: (venue) => venue.map((v) => v.venueName).join(", "),
    },
    {
      title: "Faculty",
      dataIndex: "faculty",
      key: "faculty",
      render: (faculty) =>
        faculty.map((f) => `${f.name} (${f.email})`).join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 120 }}
          onChange={(newStatus) => handleStatusChange(newStatus, record)}
        >
          {Object.keys(statusMap).map((key) => (
            <Option key={key} value={key}>
              <span style={{ color: key === "open" ? "green" : "red" }}>
                {statusMap[key]}
              </span>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDuty(record);
              form.setFieldsValue({ ...record });
              setSelectedFaculty(record.faculty);
              setSelectedVenue(record.venue);
              setStartTime(
                moment.utc(record.startTime).format("YYYY-MM-DDTHH:mm")
              );
              setEndTime(moment.utc(record.endTime).format("YYYY-MM-DDTHH:mm"));
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const handleDownloadCSV = () => {
    const csvData = duties.map((duty) => ({
      Duty: duty.dutyName,
      "Start Time": moment.utc(duty.startTime).format("DD/MM/YYYY hh:mm A"),
      "End Time": moment.utc(duty.endTime).format("DD/MM/YYYY hh:mm A"),
      Venue: duty.venue.map((v) => v.venueName).join(", "),
      Faculty: duty.faculty.map((f) => f.name).join(", "),
    }));

    const csvString = papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "general_duties.csv";
    link.click();
    URL.revokeObjectURL(url);

    message.success("CSV file downloaded successfully.");
  };

  return (
    <div className="p-6">
      <Title level={2} className="mb-4">
        General Duty Management
      </Title>

      {userRole === "admin" && (
        <div className="flex space-x-4">
          {/* Duty Selection Dropdown */}
          <Select
            className="w-64 mb-4"
            placeholder="Select Duty"
            onChange={(dutyName) => {
              console.log(dutyName);
              const duty = dutyTypes.find((type) => type.dutyName === dutyName);
              setSelectedDutyType(duty);
            }}
          >
            {dutyTypes.map((type) => (
              <Option key={type._id} value={type.dutyName}>
                {type.dutyName}
              </Option>
            ))}
          </Select>

          {userRole === "admin" && (
            <Button
              className="ml-4"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (!selectedDutyType.dutyName) {
                  message.warning("Please select a duty first.");
                  return;
                }
                setEditingDuty(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Create Duty
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-6 mb-2 mt-2 justify-between">
          <div className="flex flex-wrap items-center my-2 justify-start w-full max-w-2xl gap-x-4">
            <Select
              className="w-48"
              placeholder="Filter by Date"
              onChange={handleDateFilterChange}
            >
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>

            {selectedFilter === "custom" && (
              <RangePicker
                className="w-64 ml-4"
                onChange={handleCustomDateChange}
              />
            )}

            <Select
              className="w-48 ml-4"
              placeholder="Filter by Venue"
              onChange={handleVenueFilterChange}
            >
              {venues.map((venue) => (
                <Option key={venue.venueId} value={venue.venueId}>
                  {venue.venueName}
                </Option>
              ))}
            </Select>
          </div>
      

        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              handleDownloadCSV();
            }}
          >
            Download CSV
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredDuties}
          columns={columns}
          rowKey="_id"
          bordered
        />
      </Spin>

      <Modal
        title={editingDuty ? "Edit Duty" : "Create Duty"}
        open={isModalOpen}
        onCancel={() => {
          form.resetFields();
          setEditingDuty(null);
          setSelectedFaculty([]);
          setSelectedVenue([]);
          setVenueList([]);
          setFacultyList([]);
          setStartTime("");
          setEndTime("");
          setIsModalOpen(false);
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrEditDuty}>
          <Form.Item
            label="Duty Name"
            name="dutyName"
            initialValue={selectedDutyType.dutyName}
            disabled={userRole !== "admin"}
            rules={[{ required: true, message: "Please enter duty name" }]}
          >
            <Input disabled placeholder="Enter duty name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea
              disabled={userRole !== "admin"}
              placeholder="Enter duty description"
            />
          </Form.Item>

          <Form.Item
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <input
              disabled={userRole !== "admin"}
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setVenueList([]);
                setFacultyList([]);
                setStartTime(e.target.value);
              }}
              className="ant-input"
            />
          </Form.Item>

          <Form.Item
            label="End Time"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <input
              disabled={userRole !== "admin"}
              type="datetime-local"
              value={endTime}
              onChange={(e) => {
                setVenueList([]);
                setFacultyList([]);
                setEndTime(e.target.value);
              }}
              className="ant-input"
            />
          </Form.Item>

          <Form.Item
            label="Faculty"
            rules={[{ required: true, message: "Please select faculty" }]}
          >
            <Select
              disabled={userRole !== "admin"}
              mode="multiple"
              showSearch
              placeholder="Search and select Faculty"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              value={selectedFaculty?.map((f) => f?.name)}
              onChange={(emails) => {
                const selectedFaculty = facultyList.filter((fac) =>
                  emails.includes(fac.email)
                );
                setSelectedFaculty(selectedFaculty);
              }}
            >
              {facultyList.map((faculty) => (
                <Option key={faculty.email} value={faculty.email}>
                  {faculty.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Venue"
            rules={[{ required: true, message: "Please select venue" }]}
          >
            <Select
              disabled={userRole !== "admin"}
              mode="multiple"
              showSearch
              placeholder="Search and select venues"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              value={selectedVenue?.map((f) => f?.venueName)}
              onChange={(venueNames) => {
                console.log(venueNames);
                const selectedVenues = venueList?.filter((v) =>
                  venueNames.includes(v.venueName)
                );
                console.log(selectedVenues);
                setSelectedVenue(selectedVenues);
              }}
            >
              {venueList.map((venue) => (
                <Option key={venue.venueName} value={venue.venueName}>
                  {venue.venueName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {userRole === "admin" && (
            <>
              <Button
                disabled={userRole !== "admin"}
                type="primary"
                onClick={fetchFaculty}
                block
              >
                Get Faculty & Venues
              </Button>
              <Form.Item>
                <Button className="mt-4" type="primary" htmlType="submit">
                  {editingDuty ? "Save Changes" : "Create Duty"}
                </Button>
                {editingDuty && (
                  <Button
                    danger
                    style={{ marginLeft: "10px" }}
                    onClick={handleDeleteEvent}
                  >
                    Delete Duty
                  </Button>
                )}
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default General;
