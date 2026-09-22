// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract ConsentRegistry {
    struct Asset { address owner; bytes32 commitment; uint32 currentVersion; }
    struct Consent { bytes32 assetId; address grantee; bytes32 scopeHash; uint32 version; uint64 issuedAt; uint64 expiresAt; uint64 revokedAt; }

    mapping(bytes32 => Asset) private assets;
    mapping(bytes32 => Consent) private consents;

    error AssetExists(); error AssetNotFound(); error NotAssetOwner(); error VersionConflict();
    error ConsentExists(); error ConsentNotFound(); error ConsentAlreadyRevoked(); error InvalidConsent();
    event AssetRegistered(bytes32 indexed assetId, address indexed owner, bytes32 commitment, uint32 version);
    event VersionPublished(bytes32 indexed assetId, uint32 version, bytes32 commitment);
    event ConsentIssued(bytes32 indexed consentId, bytes32 indexed assetId, address indexed grantee, bytes32 scopeHash, uint32 version, uint64 expiresAt);
    event ConsentRevoked(bytes32 indexed consentId, uint64 revokedAt);

    function registerAsset(bytes32 assetId, bytes32 commitment) external {
        if (assets[assetId].owner != address(0)) revert AssetExists();
        assets[assetId] = Asset(msg.sender, commitment, 1);
        emit AssetRegistered(assetId, msg.sender, commitment, 1);
    }

    function publishVersion(bytes32 assetId, uint32 expectedCurrent, bytes32 commitment) external {
        Asset storage asset = assets[assetId];
        if (asset.owner == address(0)) revert AssetNotFound();
        if (asset.owner != msg.sender) revert NotAssetOwner();
        if (asset.currentVersion != expectedCurrent) revert VersionConflict();
        asset.currentVersion += 1; asset.commitment = commitment;
        emit VersionPublished(assetId, asset.currentVersion, commitment);
    }

    function issueConsent(bytes32 consentId, bytes32 assetId, address grantee, bytes32 scopeHash, uint32 version, uint64 expiresAt) external {
        Asset storage asset = assets[assetId];
        if (asset.owner == address(0)) revert AssetNotFound();
        if (asset.owner != msg.sender) revert NotAssetOwner();
        if (consents[consentId].issuedAt != 0) revert ConsentExists();
        if (grantee == address(0) || scopeHash == bytes32(0) || version != asset.currentVersion || (expiresAt != 0 && expiresAt <= block.timestamp)) revert InvalidConsent();
        consents[consentId] = Consent(assetId, grantee, scopeHash, version, uint64(block.timestamp), expiresAt, 0);
        emit ConsentIssued(consentId, assetId, grantee, scopeHash, version, expiresAt);
    }

    function revokeConsent(bytes32 consentId) external {
        Consent storage consent = consents[consentId];
        Asset storage asset = assets[consent.assetId];
        if (consent.issuedAt == 0) revert ConsentNotFound();
        if (asset.owner != msg.sender) revert NotAssetOwner();
        if (consent.revokedAt != 0) revert ConsentAlreadyRevoked();
        consent.revokedAt = uint64(block.timestamp);
        emit ConsentRevoked(consentId, consent.revokedAt);
    }

    function getAsset(bytes32 assetId) external view returns (Asset memory) { return assets[assetId]; }
    function getConsent(bytes32 consentId) external view returns (Consent memory) { return consents[consentId]; }
}
