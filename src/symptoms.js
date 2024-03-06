import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LineChart } from "./components/line-chart";

const WORDPRESS_GRAPHQL_ROOT = "https://methodical.kinsta.cloud/graphql";
const query = `{
user(id: 2, idType: DATABASE_ID) {
  databaseId
  name
  checkIns {
    nodes {
      id
      checkInFields {
        dateOfCheckIn
        relatedPatient {
          nodes {
            ... on User {
              databaseId
              name
            }
          }
        }
        symptomsRevision {
          score
          symptom {
            nodes {
              ... on Symptom {
                title
                databaseId
              }
            }
          }
        }
        lifeEventsRevision {
          impact
          dateOfEvent
          lifeEvent {
            nodes {
              ... on LifeEvent {
                title
                databaseId
              }
            }
          }
        }
      }
    }
  }
}
}`;

async function getUserCheckins() {
  try {
    const response = await axios.post(
      WORDPRESS_GRAPHQL_ROOT,
      {
        query,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (e) {
    console.log(e);
  }
}

function useFetchSymptoms() {
  return useQuery({ queryKey: ["checkins"], queryFn: getUserCheckins });
}

function parseSymptoms(checkIns) {
  if (!checkIns) {
    return null;
  }
  console.log(checkIns);
  const symptoms = {};

  checkIns.forEach((checkIn) => {
    const { dateOfCheckIn, symptomsRevision } = checkIn?.checkInFields;
    symptomsRevision?.forEach((item) => {
      // console.log(item.score);
      const score = item.score;
      const { title, databaseId } = item.symptom.nodes[0];
      symptoms[databaseId] = symptoms[databaseId] || { databaseId };
      symptoms[databaseId].scores = symptoms[databaseId].scores || [];
      if (symptoms[databaseId].scores == null || !symptoms[databaseId].scores) {
        symptoms[databaseId].scores = [];
      }
      symptoms[databaseId].scores.push({ score, dateOfCheckIn });
      symptoms[databaseId].title = title;
    });
  });
  return symptoms;
}

function generateRandomRGB() {
  // Generate a random integer between 0 and 255 (inclusive) for each color component
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Return the RGB color in the format "rgb(red, green, blue)"
  return `rgb(${red}, ${green}, ${blue})`;
}

function prepareChartData(symptoms) {
  console.log(symptoms);
  const datasets = [];
  const labels = [];
  for (const databaseId in symptoms) {
    const symptom = symptoms[databaseId];
    console.log(symptom.title);
    console.log(symptom.scores);
    const { title, scores } = symptom;
    const datasetItem = {
      type: "line",
      label: title,
      data: scores.map((item) => item.score).reverse(),
      borderColor: generateRandomRGB(),
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    };
    scores.forEach((score) => {
      labels.push(score.dateOfCheckIn);
    });

    datasets.push(datasetItem);
  }

  datasets.push({
    type: 'bubble',
    label: "Events",
    data: [
      {
        x: "2024-03-07T00:00:00+00:00",
        y: 1,
        r: 5,
      },
      {
        x: "2024-03-05T00:00:00+00:00",
        y: 2,
        r: 5,
      },
      {
        x: "2024-03-01T00:00:00+00:00",
        y: 7,
        r: 5,
      },
    ],
    backgroundColor: "rgba(53, 162, 235, 0.5)",
  });
  //   const labels = [
  //     "January",
  //     "February",
  //     "March",
  //     "April",
  //     "May",
  //     "June",
  //     "July",
  //   ];
  const uniqueLabels = [...new Set(labels)].reverse();

  const data = {
    labels: uniqueLabels,
    datasets,
  };

  return data;
}

function Symptoms() {
  const fetchSymptoms = useFetchSymptoms();

  const { data, status, isFetching, isError, error } = fetchSymptoms;

  if (isFetching) {
    return <>fetching</>;
  }

  if (isError) {
    return <>is error {error}</>;
  }

  if (!data) {
    return <>no data</>;
  }

  if (status !== "success") {
    return <>still incomplete</>;
  }

  const symptoms = parseSymptoms(data.data.data.user?.checkIns?.nodes);
  // console.log(symptoms);
  const lineChartSymptomsData = prepareChartData(symptoms);

  console.log(lineChartSymptomsData);
  return (
    <>
      <div style={{ width: "75%", height: "75%", margin: "0 auto" }}>
        <LineChart data={lineChartSymptomsData} />
      </div>
    </>
  );
}

export { Symptoms };
