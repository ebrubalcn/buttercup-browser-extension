import { makeArchiveAdditionRequest } from "./messaging.js";

export function addDropboxArchive(name, masterPassword, filename, dropboxToken, shouldCreate = false) {
    return makeArchiveAdditionRequest({
        type: "dropbox",
        name,
        masterPassword,
        filename,
        dropboxToken,
        create: shouldCreate
    });
}

export function addLocalArchive(name, masterPassword, filename, key, shouldCreate = false) {
    return makeArchiveAdditionRequest({
        type: "localfile",
        name,
        masterPassword,
        filename,
        key,
        create: shouldCreate
    });
}

export function addMyButtercupArchives(authToken, archives, masterPassword) {
    return makeArchiveAdditionRequest({
        type: "mybuttercup",
        archives,
        masterPassword,
        authToken
    });
}

export function addNextcloudArchive(name, masterPassword, filename, url, username, password, shouldCreate = false) {
    return makeArchiveAdditionRequest({
        type: "nextcloud",
        name,
        masterPassword,
        filename,
        url,
        username,
        password,
        create: shouldCreate
    });
}

export function addOwnCloudArchive(name, masterPassword, filename, url, username, password, shouldCreate = false) {
    return makeArchiveAdditionRequest({
        type: "owncloud",
        name,
        masterPassword,
        filename,
        url,
        username,
        password,
        create: shouldCreate
    });
}

export function addWebDAVArchive(name, masterPassword, filename, url, username, password, shouldCreate = false) {
    return makeArchiveAdditionRequest({
        type: "webdav",
        name,
        masterPassword,
        filename,
        url,
        username,
        password,
        create: shouldCreate
    });
}
