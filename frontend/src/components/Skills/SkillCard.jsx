import React, { useState } from "react";
import { Pencil, Trash2, MoreVertical } from "lucide-react"; // If you're using lucide-react

import { Dropdown, Menu, Modal, Tag } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import moment from "moment";
import SkillFormModal from "./SkillFormModal";
import { useSelector } from "react-redux";

function SkillCard({
  skill,
  onEdit,
  onDelete,
  setEditingSkill,
  setEditSkillData,
  sendForApproval,
  tab,
  makeDraft,
  onView,
  setViewingSkill,
  skillCategories
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const category = skillCategories.find((c) => c._id === skill.EventId)?.skillName;
  const userRole = useSelector((state) => state.persisted.user.role);

  const menuItems = [];

  if (tab === "draft") {
    menuItems.push({
      key: "SendApproval",
      label: (
        <span>
          Send For Approval
        </span>
      ),
    });
    menuItems.push({
      key: "delete",
      label: (
        <span className="text-red-500">
          Delete
        </span>
      ),
    });
  }

  if (tab === "active") {
    menuItems.push({
      key: "makeDraft",
      label: (
        <span className="">
          Move to Draft
        </span>
      ),
    });
    menuItems.push({
      key: "delete",
      label: (
        <span className="text-red-500">
          Delete
        </span>
      ),
    });
  }

  if (tab === "deactive") {
    menuItems.push({
      key: "makeDraft",
      label: <span >Move to Draft</span>,
    });
    menuItems.push({
      key: "delete",
      label: (
        <span className="text-red-500">
          Delete
        </span>
      ),
    });
  }

  if (tab === "rejected") {
    menuItems.push({
      key: "makeDraft",
      label: (
        <span className="">
          Move to Draft
        </span>
      ),
    });
    menuItems.push({
      key: "delete",
      label: (
        <span className="text-red-500">
          Delete
        </span>
      ),
    });
  }


  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "SendApproval":
        sendForApproval(skill._id);
        break;
      case "makeDraft":
        makeDraft(skill._id);
        break;
      case "delete":
        onDelete?.(skill._id);
        break;
      case "ViewDetails":
        onEdit(skill._id);
        break;
      default:
        break;
    }
  };


  return (
    <div className="relative bg-white shadow rounded-xl p-4 space-y-2">
      {/* Top Right Icons */}
      <div className="absolute top-2 right-2 flex space-x-2 ">
        {tab === "draft" && (
          <>
            <button
              onClick={() => {
                setEditingSkill(true);
                setEditSkillData(skill);
              }}
            >
              <Pencil size={18} className="text-gray-500 hover:text-blue-500" />
            </button>
            <button onClick={() => onDelete(skill._id)}>
              <Trash2 size={18} className="text-gray-500 hover:text-red-500" />
            </button>
          </>
        )}
        <Dropdown overlay={<Menu onClick={handleMenuClick} items={menuItems} />} trigger={["click"]} placement="bottomRight">
          <button>
            <MoreVertical
              size={20}
              className="text-gray-400 hover:text-gray-600"
            />
          </button>
        </Dropdown>
      </div>

      <h3 className="text-xl font-semibold">{skill.skillName}</h3>
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
        {userRole === "admin" && (
          <p>
            <TeamOutlined className="mr-1" />
            Organiser: {skill.organiser}
          </p>
        )}
      </div>

      {/* Only show view button if rejected */}
      {tab === "rejected" ? (
        <>
          <button
            className="mt-2 px-4 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50"
            onClick={() => setIsModalVisible(true)}
          >
            View Message
          </button>

          <Modal
            title="Rejection Message"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <p className="text-gray-700 whitespace-pre-wrap">
              {skill.message || "No message provided."}
            </p>
          </Modal>
        </>
      ) : (
        <button className="mt-2 px-4 py-1 border border-green-600 text-green-600 rounded cursor-pointer hover:bg-green-50" onClick={() => {
          setViewingSkill(skill);
          onView(skill);
        }}>
          View
        </button>
      )}
    </div>
  );
}

export default SkillCard;
