import React, {Component} from 'react';
import './Logout.css';
import { GoogleLogout } from 'react-google-login';

const clientId = '61064734999-7a06si2l6d02kpvd21o6sioc0a3aqqt2.apps.googleusercontent.com';

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