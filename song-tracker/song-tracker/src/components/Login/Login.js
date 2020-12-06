import React, {Component} from 'react';
import './Login.css';
import { GoogleLogin } from 'react-google-login';

class Login extends Component {
    render() {
        const onSuccess = (res) => {
            localStorage.setItem('email', res.profileObj.email);
            window.location.reload();
        };

        const onFailure = (res) => {
            console.log('[Login Failure] res:', res);
        };

        return(
            <div>
                <GoogleLogin
                    clientId={clientId}
                    buttonText="Login"
                    onSuccess={onSuccess}
                    onFailure={onFailure}
                    cookiePolicy={'single_host_origin'}
                    style={{marginTop: '100px'}}
                    isSignedIn={true}
                    className="loginButton"
                />
            </div>
        );
    }
}

export default Login;
