import React, {Component} from 'react';
import './SearchBar.css';
import {Button, Form, Col, InputGroup} from 'react-bootstrap'; 

class SearchBar extends Component {

    constructor() {
        super();

        this.searchRef = React.createRef();
        this._searchUsers = this._searchUsers.bind(this);
    }

    _searchUsers(e) {
        e.preventDefault();
        
        const username = this.searchRef.current.value;

        window.location.href = `http://localhost:3000/users/${username}`;
    }

    render() {
        return(
            <Form onSubmit={this._searchUsers}>
                    <Col>
                        <InputGroup>
                            <Form.Control type="text" ref={this.searchRef} placeholder="Search Users"/>
                            <InputGroup.Append>
                                <Button type="submit" variant="outline-danger" onClick={this._searchUsers}>Search</Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
            </Form>
        );
    }

} export default SearchBar;