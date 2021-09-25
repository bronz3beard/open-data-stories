import MonthlyMeanTemp from "../../components/antarctica/monthlyMeanTemp";

const Antarctica = (props) => {
  const { history } = props;

  const handleBack = () => {
    history.goBack();
  };
  return (
    <div style={{ textAlign: "center" }}>
      <input
        id="back"
        value="Go Back"
        type="button"
        name="back-button"
        onClick={handleBack}
        style={{ position: "absolute", top: `${1}rem`, left: `${3}rem` }}
      />
      <MonthlyMeanTemp />
    </div>
  );
};

export default Antarctica;
