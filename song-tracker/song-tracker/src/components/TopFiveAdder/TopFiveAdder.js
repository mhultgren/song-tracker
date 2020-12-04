import React, {Component} from 'react';
import './TopFiveAdder.css';
import {Button, Form, Row, Col, Modal} from 'react-bootstrap';

class TopFiveAdder extends Component {

    constructor() {
        super();

        this.state = {
            showModal: false,
        };

        this.titleRef = React.createRef();
        this.artistRef = React.createRef();
        this.albumRef = React.createRef();
        this.genreRef = React.createRef();

        this._addSong = this._addSong.bind(this);
        this._toggleModal = this._toggleModal.bind(this);
    }

    // add new song to user's library,
    // using API post
    _addSong() {
        let {userID} = this.props;
        let title = this.titleRef.current.value;
        let artist = this.artistRef.current.value;
        let album = this.albumRef.current.value;
        let genre = this.genreRef.current.value;

        

        if (title.length === 0 || artist.length === 0 || album.length === 0 || genre.length === 0) {
            alert("Please fill in all fields before submitting.");
        } else {
            // genre array made by splitting string
            genre = genre.split(', ');

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

            fetch(`http://localhost:5000/addToTopFive`, requestOptions)
            .then (response => response.json())
            .then (result => {
                console.log(result);
                window.location.reload();
            });
        }
    }

    _toggleModal() {
        this.setState( () => {
            return {
                showModal: !this.state.showModal
            }
        });
    }

    render() {
        return(
            <>
                <Button variant="primary" onClick={this._toggleModal}>
                    Add Song to Top 5
                </Button>

                <Modal
                    show={this.state.showModal}
                    onHide={this._toggleModal}
                    size="lg"
                >
                    <Modal.Header>
                        <Modal.Title>Add Song</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Note: For genre, separate distinct genres with commas and spaces (ex: Hip Hop, Jazz, Rock)</p>
                        <Form>
                            
                            <Row>
                                <Col>
                                    <Form.Control type="text" placeholder="Song" ref={this.titleRef}/>
                                </Col>

                                <Col>
                                    <Form.Control type="text" placeholder="Artist" ref={this.artistRef}/>
                                </Col>
                                
                                <Col>
                                    <Form.Control type="text" placeholder="Album" ref={this.albumRef}/>
                                </Col>

                                <Col>
                                    <Form.Control type="text" placeholder="Genre" ref={this.genreRef}/>
                                </Col>
                            </Row>

                            <Row>
                                <Col></Col>

                                <Button variant="primary" onClick={() => this._addSong()} className="addSongButton">Submit</Button>
                                
                                <Col></Col>
                            </Row>
                                
                        </Form>
                    </Modal.Body>
                </Modal>
            </>
        );
    }

} export default TopFiveAdder;