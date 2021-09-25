import Antarctica from "./pages/antarctica";
import { Route, Switch, Link } from "react-router-dom";
import "./App.css";

const Home = () => {
  return (
    <Switch>
      <Route
        exact
        path="/antarctica"
        render={(props) => <Antarctica {...props} />}
      />
      <Link
        style={{ textAlign: "center", padding: `${10}rem` }}
        to="/antarctica"
      >
        <span>
          <h1>Antarctica</h1>
        </span>
      </Link>
    </Switch>
  );
};

export default Home;
