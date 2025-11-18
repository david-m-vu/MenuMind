import "./PrimaryButton.css"

const PrimaryButton = ({ children, onClick }) => {
  return (
    <button className="primaryButton" onClick={onClick}>
      {children}
    </button>
  )
}

export default PrimaryButton
