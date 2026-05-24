import { AiOutlineInfoCircle } from "react-icons/ai";
import candidateApi from "../../../api/candidate";

const TEXT = {
  success: "C\u1eadp nh\u1eadt th\u00e0nh c\u00f4ng!",
  question:
    "B\u1ea1n c\u00f3 mu\u1ed1n x\u00f3a vi\u1ec7c l\u00e0m n\u00e0y kh\u1ecfi danh s\u00e1ch \u0111\u00e3 l\u01b0u kh\u00f4ng?",
  confirm: "X\u00e1c nh\u1eadn",
  cancel: "H\u1ee7y",
};

function SavedJobPopup({ job_id, onDeleted }) {
  const deleteSavedJob = async () => {
    if (!job_id) return;

    await candidateApi.processJobSaving(job_id, { status: 0 });
    alert(TEXT.success);

    if (onDeleted) {
      onDeleted();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="modal fade" id="jobDeletingModal">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content account-confirm-modal">
          <div className="modal-body text-center">
            <AiOutlineInfoCircle className="account-confirm-modal__icon" />
            <p>{TEXT.question}</p>
          </div>
          <div className="modal-footer border-top-0">
            <button
              type="button"
              className="btn app-button-primary"
              data-bs-dismiss="modal"
              onClick={deleteSavedJob}
            >
              {TEXT.confirm}
            </button>
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              {TEXT.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavedJobPopup;
