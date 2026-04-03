import { createContext, useContext, useEffect, useState } from "react";
import { CandidateContext } from "../../layouts/CandidateLayout";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import resumeApi from "../../../../../api/resume";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Template1 from "./template1";
import html2canvas from "html2canvas";

export const TemplateContext = createContext();

export default function Template() {
  const {
    personal,
    educations,
    experiences,
    projects,
    skills,
    certificates,
    prizes,
    activities,
    others,
    cvMode,
    setCvMode,
  } = useContext(CandidateContext);

  const { id } = useParams(); //resume ID if exist
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const [fullname, setFullname] = useState("");
  const [basicInfor, setBasicInfor] = useState({});
  const [cvEducations, setCvEducations] = useState([{}]);
  const [cvExperiences, setCvExperiences] = useState([{}]);
  const [cvProjects, setCvProjects] = useState([{}]);
  const [cvSkills, setCvSkills] = useState([{}]);
  const [cvCertificates, setCvCertificates] = useState([{}]);
  const [cvPrizes, setCvPrizes] = useState([{}]);
  const [cvActivities, setCvActivities] = useState([{}]);
  const [cvOthers, setCvOthers] = useState([{}]);
  //default order of parts
  const [parts, setParts] = useState([
    "personal",
    "objective",
    "skill",
    "certificate",
    "prize",
    "other",
    "education",
    "experience",
    "project",
    "activity",
  ]);
  const defaultPartMenu = [
    { key: "personal", name: "Thông tin cá nhân", on: true },
    { key: "objective", name: "Mục tiêu nghề nghiệp", on: true },
    { key: "education", name: "Học vấn", on: true },
    { key: "experience", name: "Kinh nghiệm", on: true },
    { key: "project", name: "Dự án", on: true },
    { key: "skill", name: "Kỹ năng", on: true },
    { key: "certificate", name: "Chứng chỉ", on: true },
    { key: "prize", name: "Giải thưởng", on: true },
    { key: "activity", name: "Hoạt động", on: true },
    { key: "other", name: "Khác", on: true },
  ];
  const [partMenu, setPartMenu] = useState(defaultPartMenu);

  const getEditResume = async () => {
    const res = await resumeApi.getById(id);
    // console.log("current resume::", res);
    const partsOrder = JSON.parse(res.parts_order);

    setParts(partsOrder);
    setBasicInfor(res.basicInfor);

    if (res.skills.length > 0) {
      setCvSkills(res.skills);
    }
    if (res.certificates.length > 0) {
      setCvCertificates(res.certificates);
    }
    if (res.prizes.length > 0) {
      setCvPrizes(res.prizes);
    }
    if (res.others.length > 0) {
      setCvOthers(res.others);
    }
    if (res.educations.length > 0) {
      setCvEducations(res.educations);
    }
    if (res.experiences.length > 0) {
      setCvExperiences(res.experiences);
    }
    if (res.projects.length > 0) {
      setCvProjects(res.projects);
    }
    if (res.activities.length > 0) {
      setCvActivities(res.activities);
    }
    //update part menu:
    let tempMenu = [...defaultPartMenu];
    tempMenu.forEach((item, index, self) => {
      if (!partsOrder.includes(item.key)) {
        self[index].on = false;
      }
    });
    setPartMenu(tempMenu);
  };

  useEffect(() => {
    reset(); //reset form to get defaultValue correctly
  }, [basicInfor, reset]);

  useEffect(() => {
    if (id) {
      setCvMode("EDIT");
      getEditResume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (basicInfor.lastname && basicInfor.firstname)
        setFullname(basicInfor.lastname + " " + basicInfor.firstname);
    } else if (cvMode === "EDIT") {
      setFullname(basicInfor.fullname);
    }
  }, [basicInfor, cvMode]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      setBasicInfor(personal);
    }
  }, [cvMode, personal]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (educations.length > 0) setCvEducations(educations);
    }
  }, [cvMode, educations]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (experiences.length > 0) setCvExperiences(experiences);
    }
  }, [cvMode, experiences]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (projects.length > 0) setCvProjects(projects);
    }
  }, [cvMode, projects]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (skills.length > 0) setCvSkills(skills);
    }
  }, [cvMode, skills]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (certificates.length > 0) setCvCertificates(certificates);
    }
  }, [certificates, cvMode]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (prizes.length > 0) setCvPrizes(prizes);
    }
  }, [cvMode, prizes]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (activities.length > 0) setCvActivities(activities);
    }
  }, [activities, cvMode]);
  useEffect(() => {
    if (cvMode === "CREATE_1") {
      if (others.length > 0) setCvOthers(others);
    }
  }, [cvMode, others]);

  const formatDate = (str) => {
    const arr = str.split(/[/, -]/);
    const len = arr.length;
    if (arr[0].length !== 4) {
      if (len === 2) {
        //only include month and year
        let temp = arr[0];
        arr[0] = arr[1];
        arr[1] = temp;
      } else if (len === 3) {
        // inlude day, month, year
        let temp = arr[0];
        arr[0] = arr[2];
        arr[2] = temp;
      }
    }

    return dayjs(arr.join("-")).format("YYYY-MM-DD");
  };

  const formatDateInPart = (part) => {
    part.forEach((item, index, self) => {
      if (item.start_date) self[index].start_date = formatDate(item.start_date);
      if (item.end_date) self[index].end_date = formatDate(item.end_date);
      if (item.receive_date)
        self[index].receive_date = formatDate(item.receive_date);
    });
  };
  const isPresentInParts = (partName) => {
    return parts.findIndex((item) => item === partName) > -1 ? true : false;
  };
  const onSubmit = async (data) => {
    console.log({ data });
    var dob = "";
    if (data.dob) {
      const [dobDay, dobMonth, dobYear] = data.dob.split("/");
      dob = dobYear + "-" + dobMonth + "-" + dobDay;
    }

    let educations = [...cvEducations];
    let experiences = [...cvExperiences];
    let projects = [...cvProjects];
    let skills = [...cvSkills];
    let certificates = [...cvCertificates];
    let prizes = [...cvPrizes];
    let activities = [...cvActivities];
    let others = [...cvOthers];

    //format date
    formatDateInPart(educations);
    formatDateInPart(experiences);
    formatDateInPart(projects);
    formatDateInPart(activities);
    formatDateInPart(certificates);
    formatDateInPart(prizes);
    //end: format date
    console.log("skills:", cvSkills);
    console.log("certificates:", certificates);
    console.log("prizes:", prizes);
    console.log("educations:", educations);
    console.log("experiences:", experiences);
    console.log("projects:", projects);
    console.log("activities:", activities);
    console.log("others:", cvOthers);
    let postData = {
      basicInfor: {
        ...data,
        dob,
        avatar: cvMode === "CREATE_1" ? basicInfor.avatar : null,
        parts_order: JSON.stringify(parts),
      },
      educations: isPresentInParts("education") ? educations : null,
      experiences: isPresentInParts("experience") ? experiences : null,
      projects: isPresentInParts("project") ? projects : null,
      skills: isPresentInParts("skill") ? skills : null,
      certificates: isPresentInParts("certificate") ? certificates : null,
      prizes: isPresentInParts("prize") ? prizes : null,
      activities: isPresentInParts("activity") ? activities : null,
      others: isPresentInParts("other") ? others : null,
    };
    if (cvMode.startsWith("CREATE")) {
      console.log(postData);
      try {
        await resumeApi.create(postData);
        toast.success("Tạo mới thành công!");
        nav("/candidate/resumes");
      } catch (e) {
        toast.error("Đã có lỗi xảy ra!");
        console.error(">>Error:", e.response.data.message);
      }
    } else if (cvMode === "EDIT") {
      postData = { ...postData, resume_id: id };
      console.log(postData);
      try {
        const res = await resumeApi.update(postData);
        console.log("res::", res);
        toast.success("Cập nhật thành công!");
        nav("/candidate/resumes");
      } catch (e) {
        toast.error("Đã có lỗi xảy ra!");
        console.error(">>Error:", e.response.data.message);
      }
    }
  };
  const handleDownload = async () => {
    // let doc = new jsPDF("p", "mm", [800, 1400]);
    let cvElement = document.querySelector("#resume");
    let filename = watch("title") + ".jpg";
    let canvas = await html2canvas(cvElement);
    let data = canvas.toDataURL("image/jpg");
    let link = document.createElement("a");

    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TemplateContext.Provider
      value={{ parts, setParts, partMenu, setPartMenu }}
    >
      <Template1
        basicInfor={basicInfor}
        fullname={fullname}
        cvEducations={cvEducations}
        setCvEducations={setCvEducations}
        cvExperiences={cvExperiences}
        setCvExperiences={setCvExperiences}
        cvProjects={cvProjects}
        setCvProjects={setCvProjects}
        cvSkills={cvSkills}
        setCvSkills={setCvSkills}
        cvCertificates={cvCertificates}
        setCvCertificates={setCvCertificates}
        cvPrizes={cvPrizes}
        setCvPrizes={setCvPrizes}
        cvActivities={cvActivities}
        setCvActivities={setCvActivities}
        cvOthers={cvOthers}
        setCvOthers={setCvOthers}
        parts={parts}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
        handleDownload={handleDownload}
      />
    </TemplateContext.Provider>
  );
}
