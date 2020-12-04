import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import LoginPage from "./components/LoginPage/LoginPage.js";
import Home from "./components/Home/Home.js";
import User from "./components/User/User.js";

function App() {
  if (!localStorage.getItem('email')) {
    return (
      <Router>
        <Switch>

          <Route exact path="/">
            <LoginPage />
          </Route>

          <Route exact path="/users/:username">
            <LoginPage />
          </Route>

        </Switch>
      </Router>
    );
  } else {
    return (
      <Router>
        <Switch>

          <Route exact path="/">
            <Home />
          </Route>

          <Route exact path="/users/:username">
            <User />
          </Route>

        </Switch>
      </Router>
    );
  }
}

export default App;
