import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Logout from '../Logout/Logout.js';
import SearchBar from '../SearchBar/SearchBar.js';
import Playlist from '../Playlist/Playlist.js';
import PlaylistButton from'../PlaylistButton/PlaylistButton.js';
import {Container, Button, Row, Col, ListGroup, Table, Modal} from 'react-bootstrap';
import './User.css';

class User extends Component {

    constructor() {
        super();

        this.state = {
            userInfo: undefined,
            parentUserInfo: undefined,
            showModal: false
        };

        this._followUser = this._followUser.bind(this);
        this._unfollowUser = this._unfollowUser.bind(this);
        this._toggleModal = this._toggleModal.bind(this);
        this._removeTopFive = this._removeTopFive.bind(this);
    }

    componentDidMount() {
        if (this.props.userInfo === undefined) {
            const userEmail = localStorage.getItem('email');
            const searchedUser = this.props.match.params.username;
            
            Promise.all([
                fetch(`http://localhost:5000/emails/${userEmail}`),
                fetch(`http://localhost:5000/users/${searchedUser}`),
            ])
            .then(([res1, res2]) => {
                return Promise.all([res1.json(), res2.json()])
            })
            .then(([res1, res2]) => {
                if (res1[0]._id === res2[0]._id) window.location.href = "http://localhost:3000/";

                this.setState({
                    parentUserInfo: res1[0],
                    userInfo: res2[0]
                });
            });

            
        } else {
            this.setState({
                userInfo: this.props.userInfo,
                parentUserInfo: this.props.userInfo
            });
        }
    }

    _followUser() {
        let mainUserID = this.state.parentUserInfo._id;

        let followedUserID = this.state.userInfo._id;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(
                {
                    mainUserID: mainUserID,
                    followedUserID: followedUserID
                }
            )
        };

        fetch(`http://localhost:5000/followUser`, requestOptions)
        .then (response => response.json())
        .then (result => {
            console.log(result);
            window.location.reload();
        });
    }

    _unfollowUser() {
        let mainUserID = this.state.parentUserInfo._id;

        let followedUserID = this.state.userInfo._id;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(
                {
                    mainUserID: mainUserID,
                    followedUserID: followedUserID
                }
            )
        };

        fetch(`http://localhost:5000/unfollowUser`, requestOptions)
        .then (response => response.json())
        .then (result => {
            console.log(result);
            window.location.reload();
        });
    }

    _removeTopFive(title, artist, album, genre) {
        let userID = this.state.userInfo._id;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(
                {
                    userID: userID,
                    title: title,
                    artist: artist,
                    album: album,
                    genre: genre
                }
            )
        };

        fetch(`http://localhost:5000/removeFromTopFive`, requestOptions)
        .then (response => response.json())
        .then (result => {
            console.log(result);
            window.location.reload();
        });
    }

    _toggleModal() {
        this.setState( () => {
            return {
                showModal: !this.state.showModal
            }
        });
    }

    render() {
        if (this.state.userInfo === undefined || this.state.parentUserInfo === undefined) {
            return (
                <Container className="mainContainer">
                    
                </Container>
            );
        }

        // create top ten list using userInfo
        let topFiveList;
        let playlist;

        if (this.props.userInfo === undefined) {
            topFiveList = this.state.userInfo.userTopFive.map(song => {
                return (
                    <ListGroup.Item key={song.title + " " + song.artist}>
                        {song.title + " - " + song.artist}
                    </ListGroup.Item>
                );
            });

            playlist = this.state.userInfo.userPlaylists.map(playlist => {
                return (
                    <ListGroup.Item key={playlist.name + " " + playlist.playlistUser}>
                        <Playlist playlistInfo={playlist}/>
                    </ListGroup.Item>
                );
            });
        } else {
            topFiveList = this.state.userInfo.userTopFive.map(song => {
                return (
                    <ListGroup.Item key={song.title + " " + song.artist}>
                        {song.title + " - " + song.artist}
                        <Button variant="danger" style={{float: "right"}} size="sm" onClick={() => this._removeTopFive(song.title, song.artist, song.album, song.genre)}>Remove</Button>
                    </ListGroup.Item>
                );
            });

            playlist = this.state.userInfo.userPlaylists.map(playlist => {
                return (
                    <ListGroup.Item key={playlist.name + " " + playlist.playlistUser}>
                        <Playlist playlistInfo={playlist} isUser={true}/>
                    </ListGroup.Item>
                );
            });
        }

        const fullLibrary = this.state.userInfo.userLibrary.map(song => {
            return (
                <tr key={song.title + " " + song.artist}>
                    <td>{song.title}</td>
                    <td>{song.artist}</td>
                    <td>{song.album}</td>
                    <td>
                        {song.genre.map(type => {
                            return type + "\n";
                        })}
                    </td>
                </tr>
            );
        });

        // create recently added table rows
        const recentlyAddedList = fullLibrary.slice(-5);

        let welcome;
        
        // generate welcome banner depending on whether or not
        // searched user is followed by the user or is the user themself
        if (this.state.userInfo._id !== this.state.parentUserInfo._id) {
            if (this.state.parentUserInfo.followedUsers.includes(this.state.userInfo._id)) {
                welcome = 
                    <div>
                        <h1>{this.state.userInfo._id}'s Profile</h1>
                        <Button variant="primary" onClick={() => this._unfollowUser()}>Unfollow</Button>
                    </div>
            } else {
                welcome = 
                    <div>
                        <h1>{this.state.userInfo._id}'s Profile</h1>
                        <Button variant="primary" onClick={() => this._followUser()}>Follow</Button>
                    </div>
            }
        } else {
            welcome = <h1>Welcome {this.state.userInfo._id}!</h1>;
        }

        return (
            <Container className="mainContainer">
                
                {welcome}

                <Logout/>

                <SearchBar/>

                <Row className="playlist">
                    <Col></Col>
                    <Col>
                        <h2>Playlists</h2>
                        <ListGroup as="ol">
                            {playlist}
                        </ListGroup>
                        {this.props.userInfo !== undefined ? 
                            <PlaylistButton userID={this.props.userInfo._id}/>
                            :
                            <></>
                        }
                    </Col>
                    <Col></Col>
                </Row>

                <Row className="musicLists">

                    <Col>
                        <h2>Top 5</h2>
                        <ListGroup as="ol">
                            {topFiveList}
                        </ListGroup>
                    </Col>

                    <Col>
                        <h2>Recently Added&nbsp;&nbsp;
                            <Button variant="primary" onClick={this._toggleModal}>
                                View Full Library
                            </Button>
                        </h2>

                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Song</th>
                                    <th>Artist</th>
                                    <th>Album</th>
                                    <th>Genre</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentlyAddedList}
                            </tbody>
                        </Table>

                        <Modal
                            show={this.state.showModal}
                            onHide={this._toggleModal}
                            size="lg"
                        >
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Song</th>
                                        <th>Artist</th>
                                        <th>Album</th>
                                        <th>Genre</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {fullLibrary}
                                </tbody>
                            </Table>
                        </Modal>

                    </Col>

                </Row>
            </Container>
        );
    }
}

export default withRouter(User);