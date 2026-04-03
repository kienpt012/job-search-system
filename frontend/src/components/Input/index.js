// import clsx from "clsx";
// import { forwardRef, useRef } from "react";

// const InputInner = forwardRef(
//   (
//     {
//       className,
//       innerClassName,
//       iconLeft,
//       iconRight,
//       cvStyle = true,
//       ...props
//     },
//     ref
//   ) => {
//     return (
//       <div className={clsx("d-flex gap-1 align-items-center", className)}>
//         <div className="text-main">{iconLeft || null}</div>
//         <input
//           type="text"
//           className={clsx(cvStyle && "cv-input", innerClassName)}
//           ref={ref}
//           {...props}
//         />
//         <div className="text-main">{iconRight || null}</div>
//       </div>
//     );
//   }
// );
// const Input = (props) => {
//   const ref = useRef(null);
//   return <InputInner {...props} ref={ref} />;
// };

// export default Input;
