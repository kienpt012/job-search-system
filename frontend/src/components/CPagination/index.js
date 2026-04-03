import clsx from "clsx";
import {
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";

export default function CPagination({
  className,
  totalPage,
  curPage,
  setCurPage,
  getList,
}) {
  const frameIndexNum = 5;
  const diffToMiddle = Math.floor(frameIndexNum / 2);
  const handleClickPage = (pageNum, offset) => {
    const current = pageNum + offset;
    if (current > 0 && current <= totalPage) {
      setCurPage(current);
      getList(current);
    }
  };

  const PageItem = ({ pageNum }) => {
    return (
      <div
        className={clsx(
          "border pointer",
          pageNum === curPage ? "bg-main text-white" : "bg-white"
        )}
        style={{ padding: "3px 11px" }}
        onClick={() => handleClickPage(pageNum, 0)}
      >
        {pageNum}
      </div>
    );
  };

  return (
    <div className={clsx("d-flex gap-1 text-main", className)}>
      <div
        className="border bg-white d-flex align-items-center pointer"
        onClick={() => handleClickPage(1, 0)}
        style={{ padding: "3px 6.5px" }}
      >
        <FiChevronsLeft />
      </div>
      <div
        className="border bg-white d-flex align-items-center pointer"
        onClick={() => handleClickPage(curPage, -1)}
        style={{ padding: "3px 6.5px" }}
      >
        <FiChevronLeft />
      </div>
      {totalPage <= 9 ? (
        Array.from({ length: totalPage }, (_, index) => (
          <PageItem key={`page_${index + 1}`} pageNum={index + 1} />
        ))
      ) : (
        <>
          {Array.from({ length: 2 }, (_, index) => (
            <PageItem key={`page_${index + 1}`} pageNum={index + 1} />
          ))}
          {curPage - diffToMiddle > 3 && (
            <div
              className="border bg-white d-flex align-items-center disabled"
              style={{ padding: "3px 6.5px" }}
            >
              <BsThreeDots />
            </div>
          )}
          {Array.from({ length: frameIndexNum }, (_, index) => {
            let first = 3;
            if (curPage - diffToMiddle <= 3) first = 3;
            else if (curPage + diffToMiddle >= totalPage - 2)
              first = totalPage - diffToMiddle - 4;
            else first = curPage - 2;
            return (
              <PageItem key={`page_${first + index}`} pageNum={first + index} />
            );
          })}
          {curPage + diffToMiddle < totalPage - 2 && (
            <div
              className="border bg-white d-flex align-items-center disabled"
              style={{ padding: "3px 6.5px" }}
            >
              <BsThreeDots />
            </div>
          )}
          {Array.from({ length: 2 }, (_, index) => (
            <PageItem
              key={`page_${totalPage - 1 + index}`}
              pageNum={totalPage - 1 + index}
            />
          ))}
        </>
      )}
      <div
        className="border bg-white d-flex align-items-center pointer"
        onClick={() => handleClickPage(curPage, 1)}
        style={{ padding: "3px 6.5px" }}
      >
        <FiChevronRight />
      </div>
      <div
        className="border bg-white d-flex align-items-center pointer"
        onClick={() => handleClickPage(totalPage, 0)}
        style={{ padding: "3px 6.5px" }}
      >
        <FiChevronsRight />
      </div>
    </div>
  );
}
