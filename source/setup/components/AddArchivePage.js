import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Card, Button, H3, H4, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import uuid from "uuid/v4";
import { Input as ButtercupInput, Button as ButtercupButton } from "@buttercup/ui";
import switchcase from "switchcase";
import LayoutMain from "./LayoutMain.js";
import ArchiveTypeChooser from "../containers/ArchiveTypeChooser.js";
import MyButtercupArchiveChooser from "../containers/MyButtercupArchiveChooser.js";
import { ARCHIVE_TYPES } from "./ArchiveTypeChooser.js";
import RemoteExplorer from "../containers/RemoteExplorer.js";

const Spacer = styled.div`
    width: 100%;
    height: 2rem;
`;
const SplitView = styled.div`
    display: grid;
    grid-template-columns: repeat(2, calc(50% - 0.5rem));
    grid-gap: 1rem;
`;

class AddArchivePage extends PureComponent {
    static propTypes = {
        dropboxAuthID: PropTypes.string,
        dropboxAuthToken: PropTypes.string,
        isConnected: PropTypes.bool.isRequired,
        isConnecting: PropTypes.bool.isRequired,
        localAuthStatus: PropTypes.string.isRequired,
        onAuthenticateDesktop: PropTypes.func.isRequired,
        onAuthenticateDropbox: PropTypes.func.isRequired,
        onAuthenticateMyButtercup: PropTypes.func.isRequired,
        onChooseDropboxBasedArchive: PropTypes.func.isRequired,
        onChooseLocallyBasedArchive: PropTypes.func.isRequired,
        onChooseWebDAVBasedArchive: PropTypes.func.isRequired,
        onConnectDesktop: PropTypes.func.isRequired,
        onConnectWebDAVBasedSource: PropTypes.func.isRequired,
        onCreateRemotePath: PropTypes.func.isRequired,
        onSelectRemotePath: PropTypes.func.isRequired,
        selectedArchiveType: PropTypes.string,
        selectedFilename: PropTypes.string,
        selectedFilenameNeedsCreation: PropTypes.bool.isRequired
    };

    // We store some details in the state, because they're sensitive. No point
    // storing them globally..
    state = {
        archiveName: "",
        dropboxAuthenticationID: "",
        localCode: "",
        masterPassword: "",
        remoteURL: "",
        remoteUsername: "",
        remotePassword: ""
    };

    componentDidMount() {
        this.setState({
            dropboxAuthenticationID: uuid(),
            myButtercupAuthenticationID: uuid()
        });
    }

    handleLocalAuth(event) {
        event.preventDefault();
        this.setState({ localCode: "" });
        this.props.onConnectDesktop();
    }

    handleDropboxAuth(event) {
        event.preventDefault();
        this.props.onAuthenticateDropbox(this.state.dropboxAuthenticationID);
    }

    handleChooseDropboxBasedFile(event) {
        event.preventDefault();
        // We send the remote credentials as these should never touch Redux
        this.props.onChooseDropboxBasedArchive(this.state.archiveName, this.state.masterPassword);
    }

    handleChooseLocalBasedFile(event) {
        event.preventDefault();
        this.props.onChooseLocallyBasedArchive(this.state.archiveName, this.state.masterPassword);
    }

    handleChooseMyButtercupBasedFile(event) {
        event.preventDefault();
        // We send the remote credentials as these should never touch Redux
        // this.props.onChooseDropboxBasedArchive(this.state.archiveName, this.state.masterPassword);
    }

    handleChooseWebDAVBasedFile(event) {
        event.preventDefault();
        // We send the remote credentials as these should never touch Redux
        this.props.onChooseWebDAVBasedArchive(
            this.props.selectedArchiveType,
            this.state.archiveName,
            this.state.masterPassword,
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleConnectLocal(event) {
        event.preventDefault();
        this.props.onAuthenticateDesktop(this.state.localCode);
    }

    handleConnectWebDAV(event) {
        event.preventDefault();
        this.props.onConnectWebDAVBasedSource(
            this.props.selectedArchiveType,
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleMyButtercupAuth(event) {
        event.preventDefault();
        this.props.onAuthenticateMyButtercup(this.state.myButtercupAuthenticationID);
    }

    handleUpdateForm(property, event) {
        this.setState({
            [property]: event.target.value
        });
    }

    render() {
        const isTargetingWebDAV = ["webdav", "owncloud", "nextcloud"].includes(this.props.selectedArchiveType);
        const isTargetingDropbox = this.props.selectedArchiveType === "dropbox";
        const isTargetingLocal = this.props.selectedArchiveType === "localfile";
        const isTargetingMyButtercup = this.props.selectedArchiveType === "mybuttercup";
        const hasAuthenticatedDropbox = typeof this.props.dropboxAuthToken === "string";
        const hasAuthenticatedMyButtercup =
            this.props.myButtercupAuthID === this.state.myButtercupAuthenticationID && this.props.myButtercupAuthToken;
        const hasAuthenticated =
            (isTargetingWebDAV && this.props.isConnected) ||
            (isTargetingDropbox && hasAuthenticatedDropbox) ||
            (isTargetingMyButtercup && hasAuthenticatedMyButtercup) ||
            (isTargetingLocal && this.props.localAuthStatus === "authenticated");
        const fetchTypeSwitch = switchcase()
            .case(/webdav|owncloud|nextcloud/, "webdav")
            .case("dropbox", "dropbox")
            .case("mybuttercup", "mybuttercup")
            .case("localfile", "localfile");
        const fetchType = fetchTypeSwitch(this.props.selectedArchiveType);
        const chooserTypeSwitch = switchcase()
            .case("mybuttercup", MyButtercupArchiveChooser)
            .default(ArchiveTypeChooser);
        const ArchiveTypeChooserInst = chooserTypeSwitch(this.props.selectedArchiveType);
        return (
            <LayoutMain title="Add Archive">
                <H4>Choose Vault Type</H4>
                <ArchiveTypeChooserInst disabled={hasAuthenticated} />
                <Spacer />
                <If condition={this.props.selectedArchiveType}>
                    <Choose>
                        <When condition={hasAuthenticated}>
                            <H4>Choose or Create Vault</H4>
                            <SplitView>
                                <Card>
                                    <RemoteExplorer
                                        onCreateRemotePath={path => this.props.onCreateRemotePath(path)}
                                        onSelectRemotePath={path => this.props.onSelectRemotePath(path)}
                                        selectedFilename={this.props.selectedFilename}
                                        selectedFilenameNeedsCreation={this.props.selectedFilenameNeedsCreation}
                                        fetchType={fetchType}
                                    />
                                </Card>
                                <Card>{this.renderArchiveNameInput()}</Card>
                            </SplitView>
                        </When>
                        <Otherwise>{this.renderConnectionInfo()}</Otherwise>
                    </Choose>
                </If>
                <If condition={isTargetingMyButtercup && hasAuthenticatedMyButtercup}>
                    <h3>Choose Archive(s)</h3>
                    <MyButtercupArchiveChooser />
                    <If condition={this.props.selectedFilename}>{this.renderArchiveNameInput()}</If>
                </If>
            </LayoutMain>
        );
    }

    renderArchiveNameInput() {
        const { selectedFilename } = this.props;
        const disabled = !selectedFilename;
        const onClickTypeSwitch = switchcase()
            .case(/webdav|owncloud|nextcloud/, ::this.handleChooseWebDAVBasedFile)
            .case("dropbox", ::this.handleChooseDropboxBasedFile)
            .case("mybuttercup", ::this.handleChooseMyButtercupBasedFile)
            .case("localfile", ::this.handleChooseLocalBasedFile);
        const onClickHandler = onClickTypeSwitch(this.props.selectedArchiveType);
        return (
            <Fragment>
                <FormGroup full label="Name" labelInfo="(required)" disabled={disabled}>
                    <InputGroup
                        leftIcon="tag"
                        disabled={disabled}
                        placeholder="Enter vault name..."
                        onChange={event => this.handleUpdateForm("archiveName", event)}
                        value={this.state.archiveName}
                    />
                </FormGroup>
                <FormGroup full label="Master Password" labelInfo="(required)" disabled={disabled}>
                    <InputGroup
                        leftIcon="lock"
                        disabled={disabled}
                        placeholder="Enter vault password..."
                        type="password"
                        onChange={event => this.handleUpdateForm("masterPassword", event)}
                        value={this.state.masterPassword}
                    />
                </FormGroup>
                <Button fill disabled={disabled} onClick={onClickHandler}>
                    Save Vault
                </Button>
            </Fragment>
        );
    }

    renderConnectionInfo() {
        const connectionOptionsDisabled = this.props.isConnecting || this.props.isConnected;
        const sectionTitle =
            this.props.selectedArchiveType === "dropbox" ? "Authenticate Cloud Source" : "Enter Connection Details";
        const isAuthenticatingDropbox = this.props.dropboxAuthID === this.state.dropboxAuthenticationID;
        const hasAuthenticatedDropbox = isAuthenticatingDropbox && this.props.dropboxAuthToken;
        const isAuthenticatingMyButtercup = this.props.myButtercupAuthID === this.state.myButtercupAuthenticationID;
        const hasAuthenticatedMyButtercup = isAuthenticatingMyButtercup && this.props.myButtercupAuthToken;
        const isAuthenticatingDesktop = this.props.localAuthStatus === "authenticating";
        const hasAuthenticatedDesktop = this.props.localAuthStatus === "authenticated";
        const isWebDAV = ["webdav", "owncloud", "nextcloud"].includes(this.props.selectedArchiveType);
        const title = ARCHIVE_TYPES.find(archiveType => archiveType.type === this.props.selectedArchiveType).title;
        return (
            <Fragment>
                <H4>{sectionTitle}</H4>
                <Choose>
                    <When condition={isWebDAV}>
                        <Card>
                            <FormGroup full label={`${title} URL`} labelInfo="(required)">
                                <InputGroup
                                    leftIcon="globe"
                                    placeholder="Enter remote URL..."
                                    disabled={connectionOptionsDisabled}
                                    onChange={event => this.handleUpdateForm("remoteURL", event)}
                                    value={this.state.remoteURL}
                                />
                            </FormGroup>
                            <FormGroup full label={`${title} Username`} labelInfo="(required)">
                                <InputGroup
                                    leftIcon="user"
                                    placeholder={`Enter ${title} username...`}
                                    disabled={connectionOptionsDisabled}
                                    onChange={event => this.handleUpdateForm("remoteUsername", event)}
                                    value={this.state.remoteUsername}
                                />
                            </FormGroup>
                            <FormGroup full label={`${title} Password`} labelInfo="(required)">
                                <InputGroup
                                    leftIcon="key"
                                    placeholder={`Enter ${title} password...`}
                                    type="password"
                                    disabled={connectionOptionsDisabled}
                                    onChange={event => this.handleUpdateForm("remotePassword", event)}
                                    value={this.state.remotePassword}
                                />
                            </FormGroup>
                            <Button
                                intent={Intent.SUCCESS}
                                onClick={::this.handleConnectWebDAV}
                                loading={this.props.isConnecting}
                                disabled={this.props.isConnected}
                            >
                                Connect
                            </Button>
                        </Card>
                    </When>
                    <When condition={this.props.selectedArchiveType === "dropbox"}>
                        <Card>
                            <H4>Dropbox</H4>
                            <p>
                                To start, please grant Buttercup access to your Dropbox account. This access will be
                                only used to store and read a Buttercup Vault that you choose or create.
                            </p>
                            <Button
                                icon="key"
                                onClick={::this.handleDropboxAuth}
                                disabled={hasAuthenticatedDropbox}
                                loading={isAuthenticatingDropbox && !hasAuthenticatedDropbox}
                            >
                                Grant Dropbox Access
                            </Button>
                        </Card>
                    </When>
                    <When condition={this.props.selectedArchiveType === "mybuttercup"}>
                        <Card>
                            <H4>MyButtercup</H4>
                            <p>
                                To start, please grant Buttercup access to your MyButtercup account.
                            </p>
                            <Button
                                icon="key"
                                onClick={::this.handleMyButtercupAuth}
                                disabled={hasAuthenticatedMyButtercup}
                                loading={isAuthenticatingMyButtercup && !hasAuthenticatedMyButtercup}
                            >
                                Grant Access
                            </Button>
                        </Card>
                    </When>
                    <When condition={this.props.selectedArchiveType === "localfile"}>
                        <Card>
                            <H4>Local File</H4>
                            <FormGroup>
                                <p>
                                    To connect a local vault on your computer you must first gain access by connecting
                                    to the{" "}
                                    <a href="https://buttercup.pw/" target="_blank">
                                        Buttercup Desktop Application
                                    </a>
                                    . Make sure that it's running and that that Browser access is enabled via the
                                    menu:&nbsp;
                                    <strong>System &#10093; Enable Browser Access</strong>.
                                </p>
                                <Button
                                    icon="desktop"
                                    onClick={::this.handleLocalAuth}
                                    disabled={this.props.isConnected}
                                    loading={this.props.isConnecting && !this.isConnected}
                                >
                                    Connect to Desktop
                                </Button>
                            </FormGroup>
                            <FormGroup full label="Authorization Code" labelInfo="(required)">
                                <InputGroup
                                    leftIcon="asterisk"
                                    placeholder="Enter Authorization Code..."
                                    disabled={hasAuthenticatedDesktop || !this.props.isConnected}
                                    loading={isAuthenticatingDesktop && !hasAuthenticatedDesktop}
                                    onChange={event => this.setState({ localCode: event.target.value.toUpperCase() })}
                                    value={this.state.localCode}
                                />
                            </FormGroup>
                            <Button
                                intent={Intent.SUCCESS}
                                onClick={::this.handleConnectLocal}
                                loading={isAuthenticatingDesktop}
                                disabled={!this.props.isConnected || !this.state.localCode || hasAuthenticatedDesktop}
                            >
                                Continue
                            </Button>
                        </Card>
                    </When>
                    <Otherwise>
                        <i>Unsupported vault type.</i>
                    </Otherwise>
                </Choose>
            </Fragment>
        );
    }
}

export default AddArchivePage;
