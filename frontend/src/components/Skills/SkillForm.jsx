import React, {useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Upload,
  message,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosInstance from "../../config/axios";
import moment from "moment";
const backendUrl = import.meta.env.VITE_BACKEND_API


const { TextArea } = Input;

function SkillForm({
  onSkillCreated,
  onCancel,
  skillsCategory,
  batchData,
  editingSkill,
  editSkillData,
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    console.log("files from props:",);
    console.log("useEffect triggered for editingSkill change");
    if (editingSkill) {
      form.setFieldsValue({
        ...editSkillData,
        skillId: editSkillData.EventId,
        regStartTime: new Date(editSkillData.regStartTime).toISOString().slice(0, 16),
        regEndTime: new Date(editSkillData.regEndTime).toISOString().slice(0, 16),
        startTime: moment(editSkillData.startTime, "HH:mm").format("HH:mm"),
        endTime: moment(editSkillData.endTime, "HH:mm").format("HH:mm"),
      });

      const existingFiles = (editSkillData.acknowledgedDoc || []).map((file, index) => ({
        uid: `${file._id || index}`, // make sure uid is string
        name: file.name,
        url: file.url,
        status: "done",
      }));
      setFileList(existingFiles);
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editingSkill, editSkillData, form]);


  // Removed unused uploadFileToServer function


  const onFinish = async (values) => {

    const { regEndTime, regStartTime, skillStartTime, skillEndTime } = values;
    // console.log("Selected Dates:", moment(regEndTime).toDate(),moment(regStartTime).toDate(),skillStartTime,skillEndTime);
    if (moment(regEndTime).toDate() < moment(regStartTime).toDate()) {
      message.error("Registration End Date should be greater than Registration Start Date");
      return;
    }
    else if (moment(skillEndTime).toDate() < moment(skillStartTime).toDate()) {
      message.error("Skill End Date should be greater than Skill Start Date");
      return;
    }

    const formData = {
      ...values,
      regStartTime: new Date(values.regStartTime + "Z"),
      regEndTime: new Date(values.regEndTime +  "Z"),
      skillStartTime: values.skillStartTime,
      skillEndTime: values.skillEndTime,
      taggedDepartment: values.taggedDepartment || [],
      taggedYear: values.taggedYear || [],
      EventId: values.skillId,
      totalDays: values.totalDays,
      maxCount: values.maxCount,
      budget: values.budget,
      startTime: values.startTime,
      endTime: values.endTime,
      venueName: values.venueName || [],
      acknowledgedDoc: fileList.map(f => ({ name: f.name, url: `${f.url}` })),
    };

    if (!editingSkill) {
      try {
        const res = await axiosInstance.post("/skillSchedule", formData);
        onSkillCreated(res.data);
        form.resetFields();
        setFileList([]);
        message.success("Skill Created Successfully !")
      } catch {
        message.error("Skill creation failed!");
      }
    } else {
      try {
        const res = await axiosInstance.put(`/skillSchedule/${editSkillData._id}`, formData)
        onSkillCreated(res.data);
        form.resetFields();
        setFileList([]);
        message.success("Skill Edited Successfully !")
      }
      catch {
        message.error("Skill edit failed!");
      }

    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="skillName"
            label="Skill Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="skillId" label="Skill Category">
            <Select
              placeholder="Select skill category"
            // value={skillsCategory.map((cat) => cat._id === editSkillData?.EventId)}
            >
              {skillsCategory?.map((dept) => (
                <Select.Option key={dept._id} value={dept._id}>
                  {dept.skillName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="taggedDepartment"
            label="Tagged Department(s)"
            rules={[
              {
                required: true,
                message: "Please select at least one department",
              },
            ]}
          >
            <Select mode="multiple" placeholder="Select departments">
              {batchData.departments?.map((dept) => (
                <Select.Option key={dept._id} value={dept.departmentName}>
                  {dept.departmentName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="venueName"
            label="Tagged Venues"
            rules={[
              {
                required: true,
                message: "Please select at least one venues",
              },
            ]}
          >
            <Select mode="multiple" placeholder="Select venues">
              {batchData.venues?.map((dept) => (
                <Select.Option key={dept._id} value={dept.venueName + " - " + dept.capacity}>
                  {dept.venueName + " - " + dept.capacity}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="taggedYear"
            label="Tagged Year"
            rules={[{ required: true, message: "Please select year" }]}
          >
            <Select placeholder="Select year">
              {batchData.batches?.map((yr) => (
                <Select.Option key={yr._id} value={yr.batchYear}>
                  {yr.batchYear}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="regStartTime"
            label="Registration Start Time"
            rules={[{ required: true }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="regEndTime"
            label="Registration End Time"
            rules={[{ required: true }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="skillStartTime"
            label="Skill Start Date"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="skillEndTime"
            label="Skill End Date"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="budget" label="Budget">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="totalDays" label="Total Days">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="maxCount" label="Max Count">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={5}>
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true }]}
          >
            <Input type="time" />
          </Form.Item>
        </Col>

        <Col span={5}>
          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true }]}
          >
            <Input type="time" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Upload
            multiple
            listType="text"
            customRequest={async ({ file, onSuccess, onError }) => {
              const formData = new FormData();
              formData.append("file", file);

              try {
                const res = await axiosInstance.post("/skillSchedule/upload", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                });

                const uploaded = {
                  uid: file.uid,
                  name: res.data.name,
                  url: `${res.data.url}`,
                  status: "done",
                };

                setFileList((prev) => [...prev, uploaded]);
                message.success("File uploaded successfully");
                onSuccess("ok");
              } catch (error) {
                console.error("Upload error:", error);
                onError(error);
              }
            }}
            fileList={fileList}
            onRemove={(file) => {
              // console.log("Remove (before):", file);

              setFileList((prev) => {
                const updated = prev.filter((f) => f.uid !== file.uid);
                // console.log("Remove (after):", updated); // ✅ Log updated list here
                return updated;
              });

              // return true to allow the removal from UI
              return true;
            }}
            onPreview={(file) => {
              return window.open(`${backendUrl}` + file.url);
            }}

          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>


        </Col>

        <Col span={24}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
}

export default SkillForm;
