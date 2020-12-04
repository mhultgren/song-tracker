import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import './LoginPage.css';
import Login from '../Login/Login.js';
import musicNote from '../../images/music-notes.png';
import {Container} from 'react-bootstrap';

class LoginPage extends Component {
    render() {
        return(
            <Container className="loginContainer">
                <h1 id="titleText">Music Tracker</h1>
                <h1>Create Followed Users Page (or modal)</h1>
                <h1>Make page look prettier</h1>
                <h2>By Myles Hultgren</h2>
                <img src={musicNote} alt="music note"/>
                <Login />
            </Container>
        );
    }
}

export default withRouter(LoginPage);