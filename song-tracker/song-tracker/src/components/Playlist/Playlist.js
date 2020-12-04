import React, {Component} from 'react';
import {Button, Table, Modal, Form, Row, Col, Container} from 'react-bootstrap';
import './Playlist.css';

class Playlist extends Component {

    constructor() {
        super();

        this.state = {
            playlistSongs: undefined,
            showModal: false
        };

        this.titleRef = React.createRef();
        this.artistRef = React.createRef();
        this.albumRef = React.createRef();
        this.genreRef = React.createRef();

        this._addSong = this._addSong.bind(this);
        this._viewPlaylist = this._viewPlaylist.bind(this);
    }

    componentDidMount() {
        const {playlistUser} = this.props.playlistInfo;
        const {name} = this.props.playlistInfo;

        fetch(`http://localhost:5000/playlist?name=${name}&username=${playlistUser}`)
        .then (async response => await response.json())
        .then (result => {
            this.setState({
                playlistSongs: result[0].playlistSongs
            });
        });
    }

    _viewPlaylist() {
        this.setState( () => {
            return {
                showModal: !this.state.showModal
            }
        });
    }

    _addSong() {
        const {playlistUser} = this.props.playlistInfo;
        const {name} = this.props.playlistInfo;
        const title = this.titleRef.current.value;
        const artist = this.artistRef.current.value;
        const album = this.albumRef.current.value;
        let genre = this.genreRef.current.value;

        if (title.length === 0 || artist.length === 0 || album.length === 0 || genre.length === 0) {
            alert("Please fill in all fields before submitting.");
        } else {
            genre = genre.split(', ');

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(
                    {
                        name: name,
                        user: playlistUser,
                        title: title,
                        artist: artist,
                        album: album,
                        genre: genre
                    }
                )
            };

            fetch(`http://localhost:5000/addToPlaylist`, requestOptions)
            .then (response => response.json())
            .then (result => {
                window.location.reload();
            });
        }
    }

    render() {
        if (this.state.playlistSongs === undefined) return (<></>);

        let playlistButton;

        if (this.props.isUser) {
            playlistButton = (
                <Container>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Control type="text" placeholder="Title" ref={this.titleRef}/>
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

                            <Button variant="primary" onClick={() => this._addSong()} className="addSongButton">Add Song</Button>
                            
                            <Col></Col>
                        </Row>
                    </Form>
                </Container>
            );
        } else playlistButton = (<></>);

        const songs = this.state.playlistSongs.map(song => {
            return (
                <tr key={song._id}>
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

        return(
            <div className="playlistDiv">
                <p>
                    {this.props.playlistInfo.name}
                </p>
                    <Button variant="primary" size="sm" onClick={this._viewPlaylist}>View Playlist</Button>
                <Modal
                    show={this.state.showModal}
                    onHide={this._viewPlaylist}
                    size="lg"
                >
                    <Modal.Header>
                        <Modal.Title>{this.props.playlistInfo.name + " - " + this.props.playlistInfo.playlistUser}</Modal.Title>
                    </Modal.Header>

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
                            {songs}
                        </tbody>
                    </Table>

                    {playlistButton}
                </Modal>
            </div>
        )
    }

} export default Playlist;