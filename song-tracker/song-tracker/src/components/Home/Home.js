import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import SongAdder from'../SongAdder/SongAdder.js';
import TopFiveAdder from '../TopFiveAdder/TopFiveAdder.js';
import User from '../User/User.js';
import {Container, Button, Form, Col, Row} from 'react-bootstrap';
import './Home.css';

class Home extends Component {

    constructor() {
        super();
        
        this.state = {
            userInfo : undefined,
            fetchDone: false,
        };
        
        this.usernameRef = React.createRef();
        this._submitUsername = this._submitUsername.bind(this);
    }

    componentDidMount() {
        let userEmail = localStorage.getItem('email');

        // get user info using user email
        fetch(`http://localhost:5000/emails/${userEmail}`)
        .then(response => response.json())
        .then(result => {
            let tempInfo = result[0];

            this.setState({
                userInfo : tempInfo,
                fetchDone: true
            });
        });
    }

    // create new user using inputted username and user email
    _submitUsername() {
        let username = this.usernameRef.current.value;
        let userEmail = localStorage.getItem('email');

        if (username.length > 0 && username.indexOf(' ') === -1) {
            fetch(`http://localhost:5000/users/${username}`)
            .then(async response => await response.json())
            .then(result => {
                if (result[0] !== undefined) {
                    alert("Username taken. Please try again.");
                }
            });

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(
                    {
                        userID: username,
                        email: userEmail
                    }
                )
            };

            fetch(`http://localhost:5000/addUser`, requestOptions)
            .then (response => response.json())
            .then (result => {
                console.log(result);
                window.location.reload();
            });
        } else {
            alert("Username invalid. Please try again.")
        }
    }

    render() {
        // if user does not exist yet,
        // create button for user to input username and create profile
        if (this.state.userInfo === undefined) {
            if (!this.state.fetchDone) {
                return (<div></div>);
            }

            return(
                <Container className="usernameContainer">
                    <h1>Welcome to the Music Tracker!</h1>

                    <h4>To continue, please enter a username in the form below.</h4>

                    <Form>
                        <Form.Row>
                            <Col>
                                <Form.Control type="text" ref={this.usernameRef} placeholder="no spaces please!"/>
                            </Col>
                            <Col xs="auto">
                                <Button variant="danger" onSubmit={() => this._submitUsername()}>Submit</Button>
                            </Col>
                        </Form.Row>
                    </Form>
                </Container>
            )
        }
        console.log(this.state.userInfo);

        return (
            <Container className="mainPageContainer">

                <User userInfo={this.state.userInfo} />

                <Row>
                    <Col>
                        {this.state.userInfo.userTopFive.length < 5 ? <TopFiveAdder userID={this.state.userInfo._id}/> : <></>}
                    </Col>

                    <Col>
                        <SongAdder userID={this.state.userInfo._id}/>
                    </Col>
                </Row>

            </Container>
        );
    }
}

export default withRouter(Home);