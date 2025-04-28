import React, { useEffect, useState } from "react";
import { Button, Empty, message, Spin, Tabs } from "antd";
import axiosInstance from "../../config/axios";
import SkillCard from "./SkillCard";
import SkillFormModal from "./SkillFormModal";
import CoursePage from "../course/CoursePage";

const { TabPane } = Tabs;

const EmptyState = ({ message = "No skills found", subText }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    <p className="text-lg font-medium">{message}</p>
    {subText && <p className="text-sm text-gray-400">{subText}</p>}
  </div>
);

function Skills() {
  // Removed unused skills state
  const [showForm, setShowForm] = useState(false);
  const [venues, setVenues] = useState([]);
  const [skillsCategory, setSkillsCategory] = useState([]);

  const [batchData, setBatchData] = useState([]);
  const [editingSkill, setEditingSkill] = useState(false);
  const [editSkillData, setEditSkillData] = useState({});
  const [draftSkills, setDraftSkills] = useState([]);
  const [activeSkills, setActiveSkills] = useState([]);
  const [deactiveSkills, setDeactiveSkills] = useState([]);
  const [rejectedSkills, setRejectedSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [viewingSkill, setViewingSkill] = useState({});
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [filteredActiveSkills, setFilteredActiveSkills] = useState([]);
  const [filteredDeactiveSkills, setFilteredDeactiveSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const openCoursePage = (skill) => {
    setViewingSkill(skill);
    setShowCourseModal(true);
  };

  const closeCoursePage = () => {
    setViewingSkill(null);
    setShowCourseModal(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    console.log("Tab changed to:", key);
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const [venueRes, skillCatRes, batchRes] = await Promise.all([
        axiosInstance.get("/master/venue"),
        axiosInstance.get("/master/skill"),
        axiosInstance.get("/master/batch/batchData"),
      ]);

      setVenues(venueRes.data);
      setSkillsCategory(skillCatRes.data);
      setBatchData(batchRes.data);

      const res = await axiosInstance.get("/skillSchedule");
      setDraftSkills(res.data.draftSkills);
      setActiveSkills(res.data.activeSkills);
      setDeactiveSkills(res.data.deactiveSkills);
      setRejectedSkills(res.data.rejectedSkills);
      setFilteredActiveSkills(res.data.activeSkills);
      setFilteredDeactiveSkills(res.data.deactiveSkills);
      

    } catch (err) {
      console.error("Failed to fetch skills:", err);
      // setSkills([]); // Removed as it is not defined and unnecessary
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSkillCreated = () => {
    fetchSkills();
    setShowForm(false);
    setEditingSkill(false);
  };

  const deleteSkill = async (id) => {
    try {
      await axiosInstance.delete(`/skillSchedule/${id}`);
      fetchSkills();
      message.success("Skill deleted successfully !");
    } catch (error) {
      console.log("Error : ", error);
      message.error("Error while deleting skill !");
    }
  };

  const sendForApproval = async (id) => {
    try {
      await axiosInstance.put(`/skillSchedule/sendRequest/${id}`, {
        status: "Pending",
        state: "Deactive",
      });
      fetchSkills();
      message.success("Request sent successfully !");
    } catch (error) {
      console.log("Error : ", error);
      message.error("Failed to send approval request");
    }
  };

  const moveToDraft = async (id) => {
    try {
      await axiosInstance.put(`/skillSchedule/moveToDraft/${id}`);
      fetchSkills();
      message.success("Skill moved to draft successfully !");
    } catch (error) {
      console.log("Error : ", error);
      message.error("Failed to move to draft");
    }
  };

  const filterSkills = () => {
    const query = searchQuery.toLowerCase();

    const applyFilters = (skillsList) =>
      skillsList.filter((skill) => {
        const matchesSearch = skill.skillName.toLowerCase().includes(query);
        const matchesCategory = selectedCategory
          ? skill.EventId === selectedCategory
          : true;
        return matchesSearch && matchesCategory;
      });

    setFilteredActiveSkills(applyFilters(activeSkills));
    setFilteredDeactiveSkills(applyFilters(deactiveSkills));
  };

  useEffect(() => {
    filterSkills();
  }, [searchQuery, selectedCategory, activeSkills, deactiveSkills]);


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skill Scheduling</h2>
        <Button type="primary" onClick={() => setShowForm(true)}>
          Create Skill
        </Button>
      </div>
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


      <SkillFormModal
        venues={venues}
        skillsCategory={skillsCategory}
        batchData={batchData}
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSkill(false);
        }}
        editingSkill={editingSkill}
        setEditingSkill={setEditingSkill}
        onSkillCreated={handleSkillCreated}
        editSkillData={editSkillData}
        setEditSkillData={setEditSkillData}
      />

      <Spin spinning={loading}>
        <Tabs
          defaultActiveKey="active"
          activeKey={activeTab}
          onChange={handleTabChange}
          className="mt-6"
        >


          <TabPane tab="Active" key="active">

            {["active", "deactive"].includes(activeTab) && (
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
                  {skillsCategory.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.skillName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filteredActiveSkills.length === 0 ? (
              <EmptyState message="No active skills found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveSkills.map((skill) => (
                  <SkillCard key={skill._id}
                    skill={skill}
                    onDelete={deleteSkill}
                    sendForApproval={sendForApproval}
                    setEditingSkill={setEditingSkill}
                    setEditSkillData={setEditSkillData}
                    tab={activeTab}
                    makeDraft={moveToDraft}
                    viewingSkill={viewingSkill}
                    setViewingSkill={setViewingSkill}
                    onView={openCoursePage}
                    skillCategories={skillsCategory}
                  />
                ))}
              </div>
            )}



          </TabPane>

          <TabPane tab="Deactive" key="deactive">
            {["active", "deactive"].includes(activeTab) && (
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
                  {skillsCategory.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.skillName}
                    </option>
                  ))}
                </select>
              </div>
            )}



            {filteredDeactiveSkills.length === 0 ? (
              <EmptyState message="No deactive skills found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeactiveSkills.map((skill) => (
                  <SkillCard key={skill._id}
                    skill={skill}
                    onDelete={deleteSkill}
                    sendForApproval={sendForApproval}
                    setEditingSkill={setEditingSkill}
                    setEditSkillData={setEditSkillData}
                    tab={activeTab}
                    makeDraft={moveToDraft}
                    viewingSkill={viewingSkill}
                    setViewingSkill={setViewingSkill}
                    skillCategories={skillsCategory}
                    onView={openCoursePage} />

                ))}
              </div>
            )}

          </TabPane>

          <TabPane tab="Rejected" key="rejected">
            {rejectedSkills?.length === 0 ? (
              <EmptyState
                message="No rejected skills"
                subText="Rejected skills will appear here with feedback."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedSkills.map((skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    onDelete={deleteSkill}
                    sendForApproval={sendForApproval}
                    setEditingSkill={setEditingSkill}
                    setEditSkillData={setEditSkillData}
                    tab={activeTab}
                    makeDraft={moveToDraft}
                    viewingSkill={viewingSkill}
                    setViewingSkill={setViewingSkill}
                    onView={openCoursePage}
                    skillCategories={skillsCategory}
                  />
                ))}
              </div>
            )}
          </TabPane>

          <TabPane tab="Draft" key="draft">
            {draftSkills?.length === 0 ? (
              <EmptyState
                message="No draft skills yet"
                subText="Create and save skills to see them here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftSkills.map((skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    onDelete={deleteSkill}
                    sendForApproval={sendForApproval}
                    setEditingSkill={setEditingSkill}
                    setEditSkillData={setEditSkillData}
                    tab={activeTab}
                    setViewingSkill={setViewingSkill}
                    viewingSkill={viewingSkill}
                    onView={openCoursePage}
                    skillCategories={skillsCategory}
                  />
                ))}
              </div>
            )}
          </TabPane>
        </Tabs>
      </Spin>


    </div>
  );
}

export default Skills;
