import React, {Component} from 'react';
import './Logout.css';
import { GoogleLogout } from 'react-google-login';

class Logout extends Component {
    render() {
        const onSuccess = ( ) => {
            localStorage.removeItem('email');
            window.location.href = 'http://localhost:3000';
        };

        return(
            <div>
                <GoogleLogout
                    clientId={clientId}
                    buttonText="Logout"
                    onLogoutSuccess={onSuccess}
                    className="logoutButton"
                />
            </div>
        );
    }
}

export default Logout;
