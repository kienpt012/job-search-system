import clsx from "clsx";
import React, { useContext, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { AiFillCaretUp } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { TemplateContext } from "../templates";

export const InforPart = ({ children, className, type }) => {
  const { parts, setParts, partMenu, setPartMenu } =
    useContext(TemplateContext);
  const [showOp, setShowOp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    let partTemp = [...parts];
    let menuTemp = [...partMenu];
    const curPartIndex = parts.findIndex((item) => item === type);
    partTemp.splice(curPartIndex, 1);
    menuTemp.forEach((item) => {
      if (item.key === type) item.on = false;
    });
    setParts(partTemp);
    setPartMenu(menuTemp);
  };
  const handleChangePos = (instruction) => {
    let temp = [...parts];
    let curInd = parts.findIndex((item) => item === type);
    let curPart = parts[curInd];
    if (instruction === "UP" && curInd > 0) {
      temp[curInd] = temp[curInd - 1];
      temp[curInd - 1] = curPart;
    } else if (instruction === "DOWN" && curInd < parts.length - 1) {
      temp[curInd] = temp[curInd + 1];
      temp[curInd + 1] = curPart;
    }
    setParts(temp);
  };
  const handleAdd = (index) => {
    let menuTemp = [...partMenu];
    let partTemp = [...parts];
    const curPartIndex = parts.findIndex((item) => item === type);
    const currentOp = menuTemp[index];
    if (!currentOp.on) {
      menuTemp[index].on = !currentOp.on;
      partTemp.splice(curPartIndex + 1, 0, currentOp.key);
      setPartMenu(menuTemp);
      setParts(partTemp);
    } else toast.info("Thông tin này đã có!");
  };

  return (
    <div
      className={clsx(
        "position-relative",
        showOp && "border border-secondary",
        className
      )}
      onMouseMove={() => setShowOp(true)}
      onMouseLeave={() => setShowOp(false)}
    >
      {children}
      {showOp && (
        <div className="position-absolute start-0 bottom-100">
          <div className="d-flex gap-1 align-items-center rounded shadow p-1 bg-white">
            <AiFillCaretDown
              className="fs-5 text-secondary pointer"
              onClick={() => handleChangePos("DOWN")}
            />
            <AiFillCaretUp
              className="fs-5 text-secondary pointer"
              onClick={() => handleChangePos("UP")}
            />
            <MdDelete
              className="fs-5 text-danger pointer"
              onClick={handleDelete}
            />
            <div
              className="position-relative"
              onMouseMove={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            >
              <IoMdAddCircleOutline
                className="fs-5 text-success pointer"
                style={{ marginBottom: "1.1px" }}
              />
              {showMenu && (
                <div
                  className="position-absolute top-100 start-0 bg-white border rounded shadow-sm ts-sm z-index-3"
                  style={{ minWidth: "160px" }}
                >
                  {partMenu?.map((item, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "px-2 py-1 pointer item-hover d-flex align-items-center",
                        item.on && "text-primary"
                      )}
                      onClick={() => handleAdd(index)}
                    >
                      <div className="flex-fill">{item.name}</div>
                      {item.on && <FaCheck className="text-primary" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* <IoMdSettings className="fs-5 text-secondary pointer" /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export const ContentItem = ({
  className,
  children,
  index,
  items,
  setItems,
  menuVaule,
}) => {
  const [showOp, setShowOp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState(menuVaule);

  const handleAdd = () => {
    let temp = [...items];
    temp.splice(index + 1, 0, {});
    setItems(temp);
  };
  const handleDelete = () => {
    let temp = [...items];
    temp.splice(index, 1);
    setItems(temp);
  };
  const handleChangeMenu = (index) => {
    let temp = [...menu];
    temp[index].on = !temp[index].on;
    setMenu(temp);
  };
  const customChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { menu: menu });
    }
    return child;
  });

  return (
    <div
      className={clsx(
        "position-relative",
        showOp && "border border-secondary",
        className
      )}
      onMouseMove={() => setShowOp(true)}
      onMouseLeave={() => setShowOp(false)}
    >
      {customChildren}
      {showOp && (
        <div className="position-absolute bottom-100 end-0 z-index-2">
          <div className="d-flex gap-1 align-items-center rounded shadow p-1 bg-white">
            <AiFillCaretDown className="fs-5 text-secondary pointer" />
            <AiFillCaretUp className="fs-5 text-secondary pointer" />
            <MdDelete
              className="fs-5 text-danger pointer"
              onClick={handleDelete}
            />
            <IoMdAddCircleOutline
              className="fs-5 text-success pointer"
              onClick={handleAdd}
            />
            {menuVaule && (
              <div
                className="position-relative"
                onMouseMove={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <IoMdSettings className="fs-5 text-secondary pointer mb-1" />
                {showMenu && (
                  <div
                    className="position-absolute top-100 end-0 bg-white border rounded shadow-sm ts-sm z-index-3"
                    style={{ minWidth: "160px" }}
                  >
                    {menu?.map((item, index) => (
                      <div
                        key={index}
                        className={clsx(
                          "px-2 py-1 pointer item-hover d-flex align-items-center",
                          item.on && "text-primary"
                        )}
                        onClick={() => handleChangeMenu(index)}
                      >
                        <div className="flex-fill">{item.name}</div>
                        {item.on && <FaCheck className="text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
