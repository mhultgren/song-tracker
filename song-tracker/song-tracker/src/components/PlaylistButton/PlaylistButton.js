import React, {Component} from 'react';
import './PlaylistButton.css';
import {Button, Form, Row, Col, Modal} from 'react-bootstrap';

class PlaylistButton extends Component {

    constructor() {
        super();

        this.state = {
            showModal: false,
        };

        this.titleRef = React.createRef();

        this._toggleModal = this._toggleModal.bind(this);
        this._createPlaylist = this._createPlaylist.bind(this);
    }

    _createPlaylist() {
        const {userID} = this.props;
        const title = this.titleRef.current.value;

        if (title.length === 0) alert("Please fill in title.")
        else {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(
                    {
                        username: userID,
                        name: title
                    }
                )
            };

            fetch(`http://localhost:5000/addPlaylist`, requestOptions)
            .then (response => response.json())
            .then (result => {
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
                <Button variant="primary" className="createPlaylistButton" onClick={this._toggleModal}>
                    Create Playlist
                </Button>

                <Modal
                    show={this.state.showModal}
                    onHide={this._toggleModal}
                    size="lg"
                >
                    <Modal.Header>
                        <Modal.Title>Create Playlist</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            
                            <Row>
                                <Col>
                                    <Form.Control type="text" placeholder="Playlist Title" ref={this.titleRef}/>
                                </Col>
                            </Row>

                            <Row>
                                <Col></Col>

                                <Button variant="primary" onClick={() => this._createPlaylist()}>Submit</Button>
                                
                                <Col></Col>
                            </Row>
                                
                        </Form>
                    </Modal.Body>
                </Modal>
            </>
        );
    }

} export default PlaylistButton;