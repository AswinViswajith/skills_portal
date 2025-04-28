const SkillSchedule = require("../models/SkillSchedule");
const User = require("../models/User");
const Department = require("../models/Department");
const Batch = require("../models/Batches");
const Skill = require("../models/Skill");
const moment = require("moment");
const MasterUser = require("../models/MasterUser");
const { generateEmailTemplateHtml, sendEmailParticipantsHtml, generateEmailTemplateHtmlRejected } = require("../utils/Email");

const calculateAttendancePercentage = (attendance) => {
  let presentCount = 0;
  attendance.forEach((session) => {
    session.participants.forEach((participant) => {
      if (participant.status === "Present" || participant.status === "On-Duty") {
        presentCount++;
      }
    });
  });
  return attendance.length
    ? ((presentCount / attendance.length) * 100).toFixed(2)
    : "0";
};

exports.createSkillSchedule = async (req, res) => {
  try {
    const {
      EventId,
      skillName,
      regStartTime,
      regEndTime,
      taggedDepartment,
      taggedYear,
      isOpenForAll,
      description,
      skillStartTime,
      skillEndTime,
      budget,
      venueId,
      totalDays,
      maxCount,
      acknowledgedDoc,
      startTime,
      endTime,
      venueName
    } = req.body;

    // console.log(req.user);
    const organiser = req.user.email;
    const newSkillSchedule = new SkillSchedule({
      EventId,
      skillName,
      regStartTime,
      regEndTime,
      organiser,
      taggedDepartment,
      taggedYear,
      description,
      skillStartTime,
      skillEndTime,
      budget,
      venueId,
      totalDays,
      maxCount,
      acknowledgedDoc,
      startTime,
      endTime,
      venueName
    });
    await newSkillSchedule.save();
    res.status(201).json(newSkillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.editSkillSchedule = async (req, res) => {
  try {
    const {
      EventId,
      skillName,
      regStartTime,
      regEndTime,
      taggedDepartment,
      taggedYear,
      isOpenForAll,
      description,
      skillStartTime,
      skillEndTime,
      budget,
      venueId,
      totalDays,
      maxCount,
      acknowledgedDoc,
      startTime,
      endTime,
      venueName
    } = req.body;
    const { id } = req.params;
    const updatedSkillSchedule = await SkillSchedule.findByIdAndUpdate(
      id,
      {
        EventId,
        skillName,
        regStartTime,
        regEndTime,
        taggedDepartment,
        taggedYear,
        description,
        skillStartTime,
        skillEndTime,
        budget,
        venueId,
        totalDays,
        maxCount,
        acknowledgedDoc,
        startTime,
        endTime,
        venueName
      },
      { new: true }
    );
    res.status(200).json(updatedSkillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSkillSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await SkillSchedule.findByIdAndDelete(id).populate("participants", "email").populate("EventId", "skillName");
    if (!skill) {
      return res.status(404).json({ message: "Skill schedule not found" });
    }
    res.status(200).json({ message: "Skill schedule deleted successfully" });

    if (skill.status === "Approved") {
      const participants = skill.participants.map((participant) => participant.email);
      console.log("participants : ", participants);
      const generateEmailTemplate = generateEmailTemplateHtml(
        skill.skillName,
        skill.EventId.skillName,
        skill.taggedDepartment,
        skill.taggedYear,
        skill.maxCount,
        skill.organiser,
        moment.utc(skill.regStartTime).format("DD MMM YYYY, hh:mm A"),
        moment.utc(skill.regEndTime).format("DD MMM YYYY, hh:mm A"),
        skill.skillStartTime,
        skill.skillEndTime,
        skill.startTime,
        skill.endTime,
        skill.description,
        skill.venueName
      );

      await sendEmailParticipantsHtml(participants, `Skill Cancelled - ${skill.skillName}`, generateEmailTemplate);
    }

  } catch (error) {
    console.error(error);
    // res.status(500).json({ message: error.message });
  }
};

exports.getAllSkillSchedules = async (req, res) => {
  try {
    const isFaculty = req.user.userType === "faculty";
    const now = moment().add(5, "hours").add(30, "minutes").toDate();

    const projection = {
      EventId: 1,
      skillName: 1,
      regStartTime: 1,
      regEndTime: 1,
      organiser: 1,
      taggedDepartment: 1,
      taggedYear: 1,
      description: 1,
      skillStartTime: 1,
      startTime: 1,
      endTime: 1,
      skillEndTime: 1,
      budget: 1,
      venueName: 1,
      totalDays: 1,
      maxCount: 1,
      acknowledgedDoc: 1,
      state: 1,
      message: 1,
      status: 1,
      participants: 1,
      maxCount: 1,
    };

    const filter = isFaculty ? { organiser: req.user.email } : {};

    const today = now.toISOString().split("T")[0];




    // Get all skill schedules (for draft filtering)
    const allSchedules = await SkillSchedule.find(filter, projection);

    const draftSkills = allSchedules.filter(
      (schedule) => schedule.status === "Draft"
    );

    const withComputedFields = (list) =>
      list.map((s) => {
        const regStart = moment(s.regStartTime).add(5, "hours").add(30, "minutes").toDate();
        const regEnd = moment(s.regEndTime).add(5, "hours").add(30, "minutes").toDate();
        const skillStart = moment(s.skillStartTime).add(5, "hours").add(30, "minutes").toDate();
        const skillEnd = moment(s.skillEndTime).add(5, "hours").add(30, "minutes").toDate();

        return {
          ...s.toObject(),
          isRegLive: moment(now).isBetween(regStart, regEnd),
          isLive: moment(now).isBetween(skillStart, skillEnd),
        };
      });

    const activeSkills = withComputedFields(
      await SkillSchedule.find(
        {
          ...filter,
          state: "Active",
          status: "Approved",
          skillEndTime: { $gte: today },
        },
        projection
      )
    );


    const deactiveSkills = await SkillSchedule.find(
      {
        ...filter,
        status: "Approved",
        skillEndTime: { $lte: today },
      },
      projection
    );

    const rejectedSkills = await SkillSchedule.find(
      {
        ...filter,
        status: "Rejected",
      },
      projection
    );

    return res.status(200).json({
      draftSkills,
      activeSkills,
      deactiveSkills,
      rejectedSkills,
    });
  } catch (error) {
    console.error("Error fetching skill schedules:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSkillScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const skillSchedule = await SkillSchedule.findById(id).populate('participants', 'name email _id collegeId').populate('feedbacks.participantId', 'name email _id collegeId');
    res.status(200).json(skillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSkillScheduleByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;
    const skillSchedule = await SkillSchedule.find(
      { EventId: eventId },
      {
        EventId: 1,
        skillName: 1,
        regStartTime: 1,
        regEndTime: 1,
        organiser: 1,
        taggedDepartment: 1,
        taggedYear: 1,
        description: 1,
        skillStartTime: 1,
        skillEndTime: 1,
        budget: 1,
        venueId: 1,
        totalDays: 1,
        maxCount: 1,
        acknowledgedDoc: 1,
      }
    );
    res.status(200).json(skillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSkillScheduleByOrganiser = async (req, res) => {
  try {
    const { organiser } = req.params;
    const skillSchedule = await SkillSchedule.find(
      { organiser },
      {
        EventId: 1,
        skillName: 1,
        regStartTime: 1,
        regEndTime: 1,
        organiser: 1,
        taggedDepartment: 1,
        taggedYear: 1,
        description: 1,
        skillStartTime: 1,
        skillEndTime: 1,
        budget: 1,
        venueId: 1,
        totalDays: 1,
        maxCount: 1,
        acknowledgedDoc: 1,
      }
    );
    res.status(200).json(skillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSkillsForStudent = async (req, res) => {
  try {
    const { studentId, taggedYear, taggedDepartment } = req.params;
    const skillSchedule = await SkillSchedule.find(
      {
        $or: [
          { taggedYear: taggedYear, taggedDepartment: taggedDepartment },
          { taggedYear: taggedYear },
          { isOpenForAll: true },
        ],
      },
      {
        EventId: 1,
        skillName: 1,
        regStartTime: 1,
        regEndTime: 1,
        organiser: 1,
        taggedDepartment: 1,
        taggedYear: 1,
        description: 1,
        skillStartTime: 1,
        skillEndTime: 1,
        budget: 1,
        venueId: 1,
        totalDays: 1,
        maxCount: 1,
        acknowledgedDoc: 1,
      }
    );
    res.status(200).json(skillSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, status } = req.body;
    console.log(state, status);
    const skillSchedule = await SkillSchedule.findById(id);
    if (!skillSchedule) {
      return res.status(404).json({ message: "Skill schedule not found" });
    }
    skillSchedule.state = state;
    skillSchedule.status = status;
    // console.log(skillSchedule);
    await skillSchedule.save();
    res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.approverOrReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const skillSchedule = await SkillSchedule.findById(id).populate("EventId", "skillName");
    // console.log(skillSchedule.taggedDepartment, skillSchedule.taggedYear);  
    const availableParticipants = await MasterUser.find({ department: { $in: skillSchedule.taggedDepartment }, batchYear: skillSchedule.taggedYear }, { name: 1, email: 1, _id: 1 });
    const participantEmails = availableParticipants.map((participant) => participant.email);
    // console.log("participants : ",participantEmails, availableParticipants);



    if (!skillSchedule) {
      return res.status(404).json({ message: "Skill schedule not found" });
    }
    if (status === "Approved") {
      skillSchedule.state = "Active";
      skillSchedule.message = message;
      skillSchedule.status = "Approved";
      await skillSchedule.save();
      res.status(200).json({ message: "Request sent successfully" });
      const generateEmailTemplate = generateEmailTemplateHtml(
        skillSchedule.skillName,
        skillSchedule.EventId.skillName,
        skillSchedule.taggedDepartment,
        skillSchedule.taggedYear,
        skillSchedule.maxCount,
        skillSchedule.organiser,
        moment.utc(skillSchedule.regStartTime).format("DD MMM YYYY, hh:mm A"),
        moment.utc(skillSchedule.regEndTime).format("DD MMM YYYY, hh:mm A"),
        skillSchedule.skillStartTime,
        skillSchedule.skillEndTime,
        skillSchedule.startTime,
        skillSchedule.endTime,
        skillSchedule.description,
        skillSchedule.venueName

      );

      await sendEmailParticipantsHtml(participantEmails, `New Skill Added - ${skillSchedule.skillName}`, generateEmailTemplate);
      await sendEmailParticipantsHtml(skillSchedule.organiser, `Skill Approved - ${skillSchedule.skillName}`, generateEmailTemplate);

    } else {
      skillSchedule.state = "Deactive";
      skillSchedule.message = message;
      skillSchedule.status = "Rejected";
      await skillSchedule.save();

      const generateEmailTemplate = generateEmailTemplateHtmlRejected(
        skillSchedule.skillName,
        skillSchedule.EventId.skillName,
        skillSchedule.taggedDepartment,
        skillSchedule.taggedYear,
        skillSchedule.maxCount,
        skillSchedule.organiser,
        skillSchedule.regStartTime,
        skillSchedule.regEndTime,
        moment.utc(skillSchedule.regStartTime).format("DD MMM YYYY, hh:mm A"),
        moment.utc(skillSchedule.regEndTime).format("DD MMM YYYY, hh:mm A"),
        skillSchedule.startTime,
        skillSchedule.endTime,
        skillSchedule.description,
        skillSchedule.message,
        skillSchedule.venueName
      )
      await sendEmailParticipantsHtml(skillSchedule.organiser, `Skill Rejected - ${skillSchedule.skillName}`, generateEmailTemplate);
      res.status(200).json({ message: "Request sent successfully" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.activeOrDeactive = async (req, res) => { };

exports.getRequests = async (req, res) => {
  try {
    const isFaculty = req.user.userType === "faculty";

    if (isFaculty) {
      const PendingRequests = await SkillSchedule.find({
        status: "Pending",
        state: "Deactive",
        organiser: req.user.email,
      });
      const PastRequests = await SkillSchedule.find({
        status: { $in: ["Approved", "Rejected"] },
        state: { $in: ["Active", "Deactive"] },
        organiser: req.user.email,
      });

      res.status(200).json({ PendingRequests, PastRequests });
      return;
    }
    else {
      const PendingRequests = await SkillSchedule.find({
        status: "Pending",
        state: "Deactive",
      });
      const PastRequests = await SkillSchedule.find({
        status: { $in: ["Approved", "Rejected"] },
        state: { $in: ["Active", "Deactive"] },
      });

      res.status(200).json({ PendingRequests, PastRequests });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.moveToDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const skillSchedule = await SkillSchedule.findById(id);
    if (!skillSchedule) {
      return res.status(404).json({ message: "Skill schedule not found" });
    }
    skillSchedule.status = "Draft";
    skillSchedule.state = "Deactive";
    await skillSchedule.save();
    res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.fetchOpen = async (req, res) => {
  try {
    const { batchYear, department } = req.query;
    const { email, userId } = req.user;
    // console.log(req.user);
    const now = moment(new Date()).add(5, "hours").add(30, "minutes").toDate();
    const Role = req.user.userType;

    if (!batchYear || !department) {
      return res.status(400).json({ message: "Batch year and department are required" });
    }

    // 1. Fetch Open Skills
    const openSkillsRaw = await SkillSchedule.find({
      taggedYear: batchYear,
      taggedDepartment: department,
      state: "Active",
      status: "Approved",
    }, {
      EventId: 1,
      skillName: 1,
      regStartTime: 1,
      regEndTime: 1,
      organiser: 1,
      taggedDepartment: 1,
      taggedYear: 1,
      description: 1,
      skillStartTime: 1,
      skillEndTime: 1,
      startTime: 1,
      endTime: 1,
      venueId: 1,
      totalDays: 1,
      maxCount: 1,
      acknowledgedDoc: 1,
      participants: 1,
      isOpenForAll: 1,
    });

    const openSkills = openSkillsRaw.map((skill) => {
      const regStart = new Date(skill.regStartTime);
      const regEnd = new Date(skill.regEndTime);

      console.log("fetchOpen", now, regStart, regEnd);
      console.log("fetchOpen", skill.regStartTime, skill.regEndTime);

      return {
        ...skill.toObject(),
        isRegistered: skill.participants.includes(userId),
        isExpired: regEnd < now,
        isRegistrationUpcoming: now < regStart,
      };
    });


    // 2. Fetch Enrolled Skills for this user
    const enrolledSkillsRaw = await SkillSchedule.find({
      participants: { $in: [userId] },
      state: "Active",
      status: "Approved",
    }, {
      EventId: 1,
      skillName: 1,
      regStartTime: 1,
      regEndTime: 1,
      organiser: 1,
      taggedDepartment: 1,
      taggedYear: 1,
      description: 1,
      skillStartTime: 1,
      skillEndTime: 1,
      startTime: 1,
      endTime: 1,
      venueId: 1,
      totalDays: 1,
      maxCount: 1,
      acknowledgedDoc: 1,
      participants: 1,
      isOpenForAll: 1,
    });

    const enrolledSkills = enrolledSkillsRaw.map((skill) => ({
      ...skill.toObject(),
      isCompleted: new Date(skill.skillEndTime) < now,
      isUpcoming: new Date(skill.skillStartTime) > now,
      isOngoing: new Date(skill.skillStartTime) < now && new Date(skill.skillEndTime) > now,
    }));



    return res.status(200).json({
      availableSkills: openSkills,
      enrolledSkills,
    });

  } catch (error) {
    console.error("Error fetching open/enrolled skills:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.enroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userId } = req.user;
    const skillId = id;
    const now = moment(new Date()).add(5, "hours").add(30, "minutes").toDate();


    console.log("enroll", skillId, email, userId, now);

    const skillSchedule = await SkillSchedule.findById(skillId);
    if (!skillSchedule) {
      return res.status(404).json({ message: "Skill schedule not found" });
    }

    if (skillSchedule.state !== "Active" || skillSchedule.status !== "Approved") {
      return res.status(400).json({ message: "Skill schedule is not active" });
    }

    if (skillSchedule.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already enrolled in this skill schedule" });
    }

    const count = skillSchedule.participants.length;
    if (count >= skillSchedule.maxCount) {
      return res.status(400).json({ message: "Skill schedule is full" });
    }

    const regStart = new Date(skillSchedule.regStartTime);
    const regEnd = new Date(skillSchedule.regEndTime);
    console.log(skillSchedule.regStartTime, skillSchedule.regEndTime

    )
    console.log(regStart, regEnd);
    if (now < regStart || now > regEnd) {
      return res.status(400).json({ message: "Registration period is over" });
    }

    skillSchedule.participants.push(userId);
    skillSchedule.save();
    res.status(200).json({ message: "Skill enrolled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.createAttendanceEntry = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { date } = req.body;

    const formattedDate = moment(date).startOf('day').toDate();

    const skill = await SkillSchedule.findById(skillId).populate('participants', 'name email');

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const alreadyExists = skill.attendance.some(att =>
      moment(att.date).isSame(formattedDate, 'day')
    );

    if (alreadyExists) {
      return res.status(400).json({ message: 'Attendance already exists for this date' });
    }

    const newAttendanceEntry = {
      date: formattedDate,
      participants: skill.participants.map((user) => ({
        participantId: user._id,
        participantName: user.name,
        participantEmail: user.email,
        status: 'Pending',
      })),
    };

    skill.attendance.push(newAttendanceEntry);
    await skill.save();

    return res.status(201).json({ message: 'Attendance created successfully' });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAttendanceDate = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { date } = req.query;

    const formattedDate = moment(date).startOf('day').toDate();

    const skill = await SkillSchedule.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const originalLength = skill.attendance.length;
    skill.attendance = skill.attendance.filter(
      (entry) => !moment(entry.date).isSame(formattedDate, 'day')
    );

    if (skill.attendance.length === originalLength) {
      return res.status(404).json({ message: 'Attendance date not found' });
    }

    await skill.save();
    return res.status(200).json({ message: 'Attendance date deleted successfully' });

  } catch (error) {
    console.error('Error deleting attendance date:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { skillId, participantId, date, status } = req.body;

    if (!["Present", "Absent", "On-Duty", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const skill = await SkillSchedule.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const session = skill.attendance.find(
      (a) => moment(a.date).format("YYYY-MM-DD") === date
    );
    if (!session) {
      return res.status(404).json({ message: "Attendance session not found" });
    }

    const participant = session.participants.find(
      (p) => p.participantId.toString() === participantId
    );
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    participant.status = status;
    await skill.save();

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { message } = req.body;
    const skill = await SkillSchedule.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const feed = {
      participantId: req.user.userId,
      message: message,
      isRead: false,
    }
    skill.feedbacks.push(feed);
    await skill.save();
    return res.status(200).json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error adding feedback:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.markFeedbackAsRead = async (req, res) => {
  try {
    const { skillId, feedbackId } = req.params;
    const skill = await SkillSchedule.findOne({ _id: skillId, 'feedbacks._id': feedbackId });
    if (!skill) {
      return res.status(404).json({ message: 'Skill or feedback not found' });
    }
    const feedback = skill.feedbacks.id(feedbackId);
    feedback.isRead = true;
    await skill.save();
    return res.status(200).json({ message: 'Feedback marked read successfully' });

  }
  catch (err) {
    console.log("Error : ", err);
    return res.status(500).json({ message: err });

  }
}


exports.adminDashboard = async (req, res) => {
  try {
    const skillSchedules = await SkillSchedule.find({ status: "Approved", state: "Active" }).populate('EventId', 'skillName');
    const totalFaculties = await User.countDocuments({ userType: 'faculty' });
    const totalStudents = await User.countDocuments({ userType: 'student' });
    const totalBatches = await Batch.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalSkillCategory = await Skill.countDocuments();
    const totalDaySkills = skillSchedules.filter((event) => event.EventId.skillName === 'Day Skill').length;
    const totalNightSkills = skillSchedules.filter((event) => event.EventId.skillName === 'Night Skill').length;
    const totalPending = await SkillSchedule.find({ status: "Pending" }).countDocuments();

    const now = moment(new Date()).add(5, "hours").add(30, "minutes").toDate();
    const ongoing = skillSchedules.filter((event) => {
      return new Date(event.skillStartTime) <= now && now <= new Date(event.skillEndTime);
    });

    const upcoming = skillSchedules.filter((event) => {
      return now < new Date(event.skillStartTime);
    });

    const past = skillSchedules.filter((event) => {
      return now > new Date(event.skillEndTime);
    });




    const metaData = {
      totalFaculties,
      totalStudents,
      totalBatches,
      totalDepartments,
      totalSkillCategory,
      totalDaySkills,
      totalNightSkills,
      totalPending,
      totalOngoingSkills: ongoing.length,
      totalUpcomingSkills: upcoming.length,
      totalSkillScheduled: skillSchedules.length
    };

    res.status(200).json({ metaData, ongoing, upcoming, past });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.facultyDashboard = async (req, res) => {
  try {
    const skillSchedules = await SkillSchedule.find({ status: "Approved", state: "Active", organiser: req.user.email }).populate('EventId', 'skillName');
    const totalDaySkills = skillSchedules.filter((event) => event.EventId.skillName === 'Day Skill').length;
    const totalNightSkills = skillSchedules.filter((event) => event.EventId.skillName === 'Night Skill').length;
    const totalPending = await SkillSchedule.find({ status: "Pending", organiser: req.user.email }).countDocuments();

    const now = moment(new Date()).add(5, "hours").add(30, "minutes").toDate();
    const ongoing = skillSchedules.filter((event) => {
      return new Date(event.skillStartTime) <= now && now <= new Date(event.skillEndTime);
    });

    const upcoming = skillSchedules.filter((event) => {
      return now < new Date(event.skillStartTime);
    });

    const past = skillSchedules.filter((event) => {
      return now > new Date(event.skillEndTime);
    });




    const metaData = {
      totalDaySkills,
      totalNightSkills,
      totalPending,
      totalOngoingSkills: ongoing.length,
      totalUpcomingSkills: upcoming.length,
      totalSkillScheduled: skillSchedules.length
    };

    res.status(200).json({ metaData, ongoing, upcoming, past });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.exportAttendance = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await SkillSchedule.findById(skillId);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const exportData = skill.attendance.map((session) => ({
      date: moment(session.date).format("YYYY-MM-DD"),
      participants: session.participants.map((p) => ({
        name: p.participantName,
        email: p.participantEmail,
        status: p.status,
      })),
    }));

    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error exporting attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};