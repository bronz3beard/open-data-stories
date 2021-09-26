import React, { useEffect } from "react";
import firebase from "../../api";
import MonthlyMeanTemp from "../../components/antarctica/monthlyMeanTemp";

const Antarctica = (props) => {
  const { history } = props;

  // useEffect(() => {
  //   const storageRef = firebase
  //         .storage()
  //         .ref(
  // }, []);

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
      <div
        style={{
          top: `${0.5}rem`,
          right: `${0.5}rem`,
          width: "500px",
          height: "500px",
          zIndex: -1,
          position: "absolute",
        }}
      >
        <img
          style={{
            width: "100%",
          }}
          src="https://firebasestorage.googleapis.com/v0/b/open-data-stoires.appspot.com/o/australia_to_antarctic_distances_15322_draft_v2.1600x900.webp?alt=media&token=b500c473-2d81-4e0a-8c27-bceb30a48424"
        />
      </div>
      <MonthlyMeanTemp />
    </div>
  );
};

export default Antarctica;
