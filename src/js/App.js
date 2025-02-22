import React from 'react';
import {TitleBar} from 'react-desktop/windows';
import {Theme as UWPThemeProvider, getTheme} from 'react-uwp/Theme';
import NavigationView from 'react-uwp/NavigationView';
import SplitViewCommand from 'react-uwp/SplitViewCommand';
import {IconButton} from 'react-uwp';
import ToastHandler from './toastHandler.js';
import PubSub from 'pubsub-js';
import {HashRouter as Router, Redirect, Link, Route} from 'react-router-dom';

import UWPNoise from '../img/uwp-noise.png';

import Search from './Search.js';
import Games from './games.js';
import Import from './Import.js';
import Remote from './Remote.js';

// Using window.require so babel doesn't change the node require
const electron = window.require('electron');
const remote = new Remote(electron.remote);

// Log renderer errors
const log = window.require('electron-log');
log.catchErrors({showDialog: true});

import '../css/App.css';

import Steam from './Steam.js';
window.Steam = Steam;

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {isMaximized: false, showBack: false};
        this.toggleMaximize = this.toggleMaximize.bind(this);

        //Track windows snap calling maximize / unmaximize
        const window = remote.getCurrentWindow();

        window.on('maximize', () => {
            this.setState({ isMaximized: true });
        });

        window.on('unmaximize', () => {
            this.setState({ isMaximized: false });
        });

        PubSub.subscribe('showBack', (message, args) => {
            this.setState({showBack: args});
        });
    }

    close() {
        const window = remote.getCurrentWindow();
        window.close();
    }

    minimize() {
        const window = remote.getCurrentWindow();
        window.minimize();
    }

    toggleMaximize() {
        const window = remote.getCurrentWindow();
        this.setState({ isMaximized: !this.state.isMaximized });
        if(!this.state.isMaximized) {
            window.maximize();
        } else {
            window.unmaximize();
        }
    }

    handleNavRedirect(path) {
        this.setState({redirectTo: path});
    }

    render() {
        const navWidth = 48;
        const accentColor = remote.systemPreferences.getAccentColor();

        const navigationTopNodes = [
            <SplitViewCommand key="0" label="Library" icon={'Library'} onClick={() => this.handleNavRedirect('/')} />,
            <SplitViewCommand key="1" label="Import Games" icon={'ImportAll'} onClick={() => this.handleNavRedirect('/import')} />
        ];

        let backBtn;
        let titleWidth = '100%';
        if (this.state.showBack) {
            backBtn = <Link to='/' onClick={() => {this.setState({showBack: false});}}>
                <IconButton style={{
                    display: 'block',
                    position: 'relative',
                    float: 'left',
                    width: navWidth,
                    height: 30,
                    lineHeight: '31px',
                    backgroundColor: '#141414',
                    zIndex: 2,
                }} size={22}>Back</IconButton>
            </Link>;
            titleWidth = `calc(100% - ${navWidth}px)`;
        }

        return (
            <UWPThemeProvider
                theme={getTheme({
                    themeName: 'dark',
                    accent: `#${accentColor}`,
                    useFluentDesign: true
                })}
            >
                <Router>
                    <div style={{backgroundColor: '#1a1a1a'}}>
                        {backBtn}
                        <TitleBar
                            title="SteamGridDB Manager"
                            style={{
                                position: 'relative',
                                top: 0,
                                width: titleWidth,
                                height: 30,
                                zIndex: 2
                            }}
                            controls
                            isMaximized={this.state.isMaximized}
                            onCloseClick={this.close}
                            onMinimizeClick={this.minimize}
                            onMaximizeClick={this.toggleMaximize}
                            onRestoreDownClick = {this.toggleMaximize}
                            background="transparent"
                            color="#fff"
                            theme="dark"
                        />
                        <NavigationView
                            style={{
                                position: 'absolute',
                                top: 0,
                                height: 'calc(100vh - 30px)',
                                width: '100%',
                            }}
                            paneStyle={{
                                marginTop: 30,
                                backgroundColor: 'rgba(0,0,0,.2)',
                                backgroundImage: `url(${UWPNoise})`,
                                backdropFilter: 'blur(20px)'
                            }}
                            background='transparent'
                            displayMode='overlay'
                            autoResize={false}
                            initWidth={navWidth}
                            navigationTopNodes={navigationTopNodes}
                            focusNavigationNodeIndex={0}
                        >
                            <div style={{...getTheme().typographyStyles.base,
                                marginLeft: navWidth,
                                height: '100%',
                                position: 'relative',
                                overflow: 'auto',
                                zIndex: 0
                            }}>
                                {this.state.redirectTo &&
                                    <Redirect to={this.state.redirectTo} />
                                }

                                <Route exact path="/" component={Games} />
                                <Route exact path="/import" component={Import} />
                                <Route exact path="/search" component={Search} />
                            </div>
                        </NavigationView>
                    </div>
                </Router>
                <ToastHandler />
            </UWPThemeProvider>
        );
    }
}

export default App;
