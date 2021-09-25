import React, { useEffect, useState } from "react";
import firebase from "../../api";
import { dataFilter, getUniqueArrayObjects } from "../../utils/functions";
import {
  Bar,
  Point,
  VictoryBar,
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
  VictoryGroup,
  VictoryLabel,
  VictoryLegend,
  VictoryArea,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
  VictorySharedEvents,
  VictoryZoomContainer,
  VictoryCursorContainer,
} from "victory";

const MonthlyMeanTemp = () => {
  const [isLoading, setIsLoading] = useState(true);
const [dataIsFiltering, setDataIsFiltering] = useState(false);

const [yearFilterValue, setYearFilterValue] = useState("2020");
const [anomalyFilterValue, setAnomalyFilterValue] = useState("Anomaly");
const [siteFilterValue, setSiteFilterValue] = useState("");

const [antarctica, setAntarctica] = useState([]);

const [graphXAxis, setGraphXAxis] = useState([]);
const [graphYAxis, setGraphYAxis] = useState([]);

useEffect(() => {
  const itemsRef = firebase.database().ref("antarctica/");

  const antarcticaState = [];

  itemsRef
    .once("value")
    .then((snapshot) => {
      const items = snapshot.val();

      for (const item in items) {
        const field = items[item];
        const fbId = item;

        antarcticaState.push({
          ...field,
          fbId,
        });
      }

      if (items && antarcticaState) {
        setAntarctica(
          antarcticaState
            .filter((item) => !item.Parameter.includes(anomalyFilterValue))
            .filter((item) => item.Date.includes(yearFilterValue))
            .map((item) => ({ ...item, y: item.Value, x: item.Date }))
        );
        // change this to change name along the left side of the graph - filter out 0 falsy values
        setGraphYAxis(antarcticaState.map((item) => ({ y: item.Value })));

        // change this to change name along the bottom of the graph
        setGraphXAxis(
          antarcticaState
            .filter(
              (value, index, self) =>
                self
                  .map((item) => item.Date.split("-")[1])
                  .indexOf(value.Date.split("-")[1]) === index
            )
            .map((item) => ({
              x: item.Date.split("-")[1],
            }))
        );
        setIsLoading(false);
        setDataIsFiltering(false);
      }
    })
    .catch((error) => {
      console.error("🚀 ~ file: index.js ~ line 93 ~ .then ~ error", error);
    });
}, [isLoading, yearFilterValue, anomalyFilterValue]);

const handleYearFilterValueChange = (event) => {
  const value = event.target.value;

  setYearFilterValue(value);
  setDataIsFiltering(!dataIsFiltering);
};

const handleLegendClick = (event) => {
  const name = event.target.name;
  if (name) {
    setSiteFilterValue("");
  } else {
    setSiteFilterValue(event.target.innerHTML);
  }
};
// Date: "April-1948"
// Latitude: "54° 37.2' S"
// Longitude: "158° 51.7' E"
// Parameter: "Air Temperature"
// Place: "Macquarie Island"
// "Unit of Measure": "deg C"
// Value: 5
// fbId: "0"

const dataFiltered = !siteFilterValue
  ? antarctica
  : dataFilter(antarctica, siteFilterValue, "Place");

if (isLoading) {
  return <div>Loading...</div>;
}

return (
  <div>
    <h1>Monthly mean air temperatures for Australian Antarctic Stations</h1>
    <div style={{ padding: `${5}rem ${0} ${2}rem ${0}` }}>
      <label
        style={{ position: "relative", padding: `${0} ${1}rem ${0} ${0}` }}
      >
        Select a Year
      </label>
      <select value={yearFilterValue} onChange={handleYearFilterValueChange}>
        {graphXAxis.map((item) => {
          return <option>{item.x}</option>;
        })}
      </select>
      <input
        type="button"
        id="reset-filter"
        name="reset-sites"
        value="Reset Site Filter"
        onClick={handleLegendClick}
        style={{ cursor: "pointer", margin: `${1}rem ${0} ${0} ${0.5}rem` }}
      />
      <br />
      <em>
        To view data points more clearly, scroll with your mouse to zoom in,
        then click and drag to move the grid.
      </em>
      <br />
      {dataIsFiltering && (
        <h3>
          <strong>Filtering Data...</strong>
        </h3>
      )}
    </div>
    <label
      style={{
        float: "left",
        position: "relative",
        margin: `${0} ${0} ${0} ${3}rem`,
      }}
    >
      Select a Site
    </label>
    {!isLoading && dataFiltered.length > 0 ? (
      <VictoryChart
        theme={VictoryTheme.material}
        // domain={{ y: [-80, 19] }}
        style={{
          background: { fill: "grey" },
        }}
        height={500}
        width={2000}
        domainPadding={20}
        // scale={{ x: "linear", y: "log" }}
        // padding={{ top: 40, bottom: 50, left: 40, right: 200 }}
        theme={VictoryTheme.material}
        containerComponent={<VictoryZoomContainer />}
      >
        <VictoryLegend
          y={0}
          x={50}
          centerTitle
          gutter={20}
          orientation="horizontal"
          borderPadding={{ right: 10 }}
          style={{
            border: { stroke: "black" },
            title: { fontSize: 10 },
            labels: { cursor: "pointer", fontSize: 20 },
          }}
          events={[
            {
              target: "labels",
              eventHandlers: {
                onClick: handleLegendClick,
              },
            },
          ]}
          data={[
            { name: "Mawson", symbol: { fill: "red" } },
            { name: "Davis", symbol: { fill: "orange" } },
            { name: "Casey", symbol: { fill: "blue" } },
            { name: "Macquarie Island", symbol: { fill: "green" } },
            { name: "Spit Bay", symbol: { fill: "purple" } },
            { name: "Atlas Cove", symbol: { fill: "yellow" } },
          ]}
        />
        <VictoryAxis
          offsetY={50}
          label="Month"
          orientation="bottom"
          style={{
            tickLabels: {
              angle: -12,
              fontSize: 18,
            },
          }}
          tickLabelComponent={<VictoryLabel dy={10} />}
        />
        <VictoryAxis
          label="Temp"
          dependentAxis
          orientation="left"
          style={{
            tickLabels: {
              fontSize: 18,
            },
          }}
          tickLabelComponent={<VictoryLabel dx={-5} />}
        />
        <VictoryGroup
          // offset={25}
          // categories={{
          //   x: [
          //     "Mawson",
          //     "Davis",
          //     "Casey",
          //     "Macquarie Island",
          //     "Spit Bay",
          //     "Atlas Cove",
          //   ],
          // }}
          data={dataFiltered}
          labels={({ datum }) => `${datum.Value}°C`}
          colorScale={["red", "orange", "blue", "green", "purple", "yellow"]}
        >
          <VictoryLine interpolation="monotoneY" />
          <VictoryScatter
            size={8}
            // containerComponent={
            //   <VictoryCursorContainer cursorLabel={({ datum }) => datum.y} />
            // }
            style={{
              data: {
                fill: ({ datum }) => {
                  const SpitBay =
                    datum.Place === "Spit Bay" ? "purple" : "yellow";
                  const MacquarieIsland =
                    datum.Place === "Macquarie Island" ? "green" : SpitBay;
                  const Casey =
                    datum.Place === "Casey" ? "blue" : MacquarieIsland;
                  const Davis = datum.Place === "Davis" ? "orange" : Casey;
                  const Mawson = datum.Place === "Mawson" ? "red" : Davis;

                  return Mawson;
                },
              },
              parent: { border: "1px solid #ccc" },
              labels: { fontSize: 14, fontWeight: 500, fill: "white" },
            }}
            labelComponent={<VictoryLabel dy={0} textAnchor="middle" />}
          />
          {/* <VictoryBar
              labels={({ datum }) => datum.y}
              data={dataFiltered.filter((item) =>
                item.Place.includes("Mawson")
              )}
              dataComponent={<Bar transform="translate(80)" />}
            />
            <VictoryBar
              labels={({ datum }) => datum.y}
              dataComponent={<Bar transform="translate(75)" />}
              data={dataFiltered.filter((item) => item.Place.includes("Davis"))}
            />
            <VictoryBar
              labels={({ datum }) => datum.y}
              dataComponent={<Bar transform="translate(70)" />}
              data={dataFiltered.filter((item) => item.Place.includes("Casey"))}
            />
            <VictoryBar
              labels={({ datum }) => datum.y}
              dataComponent={<Bar transform="translate(65)" />}
              data={dataFiltered.filter((item) =>
                item.Place.includes("Macquarie Island")
              )}
            />
            <VictoryBar
              labels={({ datum }) => datum.y}
              dataComponent={<Bar transform="translate(60)" />}
              data={dataFiltered.filter((item) =>
                item.Place.includes("Spit Bay")
              )}
            />
            <VictoryBar
              labels={({ datum }) => datum.y}
              data={dataFiltered.filter((item) =>
                item.Place.includes("Atlas Cove")
              )}
            /> */}
        </VictoryGroup>
      </VictoryChart>
    ) : (
      <VictoryChart
        width={2000}
        domainPadding={10}
        theme={VictoryTheme.material}
      />
    )}
  </div>
);
};

export default MonthlyMeanTemp;
