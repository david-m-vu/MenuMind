import "./SecondaryButton.css"

const SecondaryButton = ({ children, onClick }) => {
  return (
    <button className="secondaryButton" onClick={onClick}>
      {children}
    </button>
  )
}

export default SecondaryButton
