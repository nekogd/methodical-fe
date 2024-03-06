import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

function App() {
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
  const [checkIns, setCheckIns] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [symptomsTest, setSymptomsTest] = useState([]);
  useEffect(() => {
    axios
      .post(
        WORDPRESS_GRAPHQL_ROOT,
        {
          query,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const checkIns = response?.data?.data?.user?.checkIns?.nodes;
        setCheckIns(checkIns);

        const symptomsInternal = [];
        
        checkIns.forEach((checkIn) => {
          const { dateOfCheckIn, symptomsRevision } = checkIn?.checkInFields;
          symptomsRevision?.forEach((item) => {
            console.log(item.score);
            const score = item.score;
            const { title, databaseId } = item.symptom.nodes[0];
            symptomsInternal[databaseId] = { databaseId };
            symptomsTest.push({score,databaseId,dateOfCheckIn,title});
            console.log(symptomsInternal);
            //symptoms[databaseId].scores = symptoms[databaseId].scores || [];
            if (symptomsInternal[databaseId].scores == null || !symptomsInternal[databaseId].scores) {
              symptomsInternal[databaseId].scores = [];
            }
            symptomsInternal[databaseId].scores.push({score, dateOfCheckIn});
            symptomsInternal[databaseId].title = title;
          });
        });
        const filteredSymptoms = symptomsInternal.filter(
          (item) => item.databaseId != null
        );

        setSymptoms(filteredSymptoms);
        setSymptomsTest(symptomsTest)
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  if (checkIns.length === 0) {
    return <>wait checkins</>;
  }

  if (symptoms.length === 0) {
    return <>wait symptoms</>;
  }

  console.log('jere');
  console.log(symptomsTest)
  console.log(checkIns);
  console.log(symptoms);

  const datasets = symptoms.map((symptom) => {
    const { title,  scores } = symptom;
    console.log(scores)
    return {
      label: title,
      data: scores.map((score) => score.score),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    };
  });

  const data = {
    labels,
    datasets,
    // datasets: [
    //   {
    //     label:
    //       checkIns[0].checkInFields?.symptomsRevision[0].symptom.nodes[0].title,
    //     data: checkIns?.map(
    //       (item) => item?.checkInFields?.symptomsRevision[0]?.score
    //     ),
    //     borderColor: "rgb(255, 99, 132)",
    //     backgroundColor: "rgba(255, 99, 132, 0.5)",
    //   },
    //   {
    //     label: "Dataset 2",
    //     data: labels.map(() => 1),
    //     borderColor: "rgb(53, 162, 235)",
    //     backgroundColor: "rgba(53, 162, 235, 0.5)",
    //   },
    // ],
  };

  return (
    <div className="App">
      {checkIns &&
        checkIns.map((item) => {
          console.log(item);
          const { id, checkInFields } = item;

          const { dateOfCheckIn, symptomsRevision } = checkInFields;
          return (
            <div>
              <p>id: {id}</p>
              <p>date: {dateOfCheckIn}</p>
              {symptomsRevision.map((item) => {
                const { title } = item.symptom.nodes[0];
                return (
                  <li>
                    name: {title} , score: {item.score}
                  </li>
                );
              })}
            </div>
          );
        })}
      <Line options={options} data={data} />
    </div>
  );
}

export default App;
