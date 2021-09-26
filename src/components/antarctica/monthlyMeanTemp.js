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
  const [lineColour, setLineColour] = useState("");

  const [allData, setAllData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [allAnomalyData, setAllAnomalyData] = useState([]);
  const [yearlyAnomalyData, setYearlyAnomalyData] = useState([]);

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
          setAllData(
            antarcticaState
              .filter((item) => !item.Parameter.includes(anomalyFilterValue))
              .map((item) => ({
                ...item,
                y: item.Value,
                x: item.Date.split("-")[1],
              }))
          );
          setYearlyData(
            antarcticaState
              .filter((item) => !item.Parameter.includes(anomalyFilterValue))
              .filter((item) => item.Date.includes(yearFilterValue))
              .map((item) => ({ ...item, y: item.Value, x: item.Date }))
          );

          setAllAnomalyData(
            antarcticaState
              .filter((item) => item.Parameter.includes(anomalyFilterValue))
              .map((item) => ({ ...item, y: item.Value, x: item.Date }))
          );
          setYearlyAnomalyData(
            antarcticaState
              .filter((item) => item.Parameter.includes(anomalyFilterValue))
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
    const value = event.target.innerHTML;

    if (name) {
      setSiteFilterValue("");
      setLineColour("");
    } else {
      setSiteFilterValue(value);
      const SpitBay = value === "Spit Bay" ? "purple" : "brown";
      const MacquarieIsland = value === "Macquarie Island" ? "green" : SpitBay;
      const Casey = value === "Casey" ? "blue" : MacquarieIsland;
      const Davis = value === "Davis" ? "orange" : Casey;
      const Mawson = value === "Mawson" ? "red" : Davis;

      setLineColour(Mawson);
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
    ? yearlyData
    : dataFilter(yearlyData, siteFilterValue, "Place");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: `${1.5}rem ${2}rem ${2}rem ${2}rem` }}>
      <h1>Monthly mean air temperatures for Australian Antarctic Stations</h1>
      <div
        style={{
          width: `${100}%`,
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ padding: `${5}rem ${0} ${0}rem ${0}` }}>
          <label
            style={{ position: "relative", padding: `${0} ${1}rem ${0} ${0}` }}
          >
            Select a Year
          </label>
          <select
            value={yearFilterValue}
            onChange={handleYearFilterValueChange}
          >
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
        <h3>Select a Site</h3>
        <VictoryLegend
          y={0}
          x={100}
          height={10}
          centerTitle
          gutter={20}
          orientation="horizontal"
          borderPadding={{ right: 10, left: 10 }}
          style={{
            border: { stroke: "black" },
            title: { fontSize: 10 },
            labels: { cursor: "pointer", fontSize: 4 },
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
            { name: "Atlas Cove", symbol: { fill: "brown" } },
          ]}
        />
      </div>
      {!isLoading && dataFiltered.length > 0 ? (
        <>
          <VictoryChart
            theme={VictoryTheme.material}
            style={{
              background: { fill: "grey" },
            }}
            height={400}
            width={2000}
            domainPadding={20}
            theme={VictoryTheme.material}
            containerComponent={<VictoryZoomContainer />}
          >
            <VictoryLegend
              data={[]}
              height={10}
              centerTitle
              title="Site Yearly Data"
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
                  fontSize: 16,
                },
              }}
              tickLabelComponent={<VictoryLabel dx={5} />}
            />
            <VictoryGroup
              data={dataFiltered}
              labels={({ datum }) => `${datum.Value}°C`}
              colorScale={["red", "orange", "blue", "green", "purple", "brown"]}
            >
              <VictoryLine interpolation="monotoneY" />
              <VictoryScatter
                size={8}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      const SpitBay =
                        datum.Place === "Spit Bay" ? "purple" : "brown";
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
        </>
      ) : (
        <VictoryChart
          width={2000}
          domainPadding={10}
          theme={VictoryTheme.material}
        />
      )}
      <hr />
      {!isLoading && (
        <VictoryChart
          theme={VictoryTheme.material}
          style={{
            background: { fill: "grey" },
          }}
          height={400}
          width={2000}
          domainPadding={20}
          theme={VictoryTheme.material}
          containerComponent={
            <VictoryCursorContainer
              cursorLabel={({ datum }) => `${datum.y.toFixed(4)}°C`}
            />
          }
        >
          <VictoryLegend
            data={[]}
            height={10}
            centerTitle
            title="Site Lifetime Data"
          />
          <VictoryAxis
            offsetY={50}
            orientation="bottom"
            style={{
              tickLabels: {
                angle: -90,
                fontSize: 18,
              },
            }}
            tickLabelComponent={<VictoryLabel dx={-10} dy={-5} />}
          />
          <VictoryAxis
            label="Temp"
            dependentAxis
            orientation="left"
            style={{
              tickLabels: {
                fontSize: 16,
              },
            }}
            tickLabelComponent={<VictoryLabel dx={5} />}
          />
          <VictoryLine
            data={dataFilter(allData, siteFilterValue, "Place")}
            style={{
              data: {
                stroke: lineColour,
              },
            }}
            // interpolation="basis"
          />
        </VictoryChart>
      )}
    </div>
  );
};

export default MonthlyMeanTemp;
