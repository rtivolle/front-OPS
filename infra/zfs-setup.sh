#!/bin/bash
# Script to create ZFS datasets for Nextcloud integration

# Exit on error
set -e

# Default pool name
POOL_NAME="zfs"

# Create datasets
echo "Creating ZFS datasets..."
zfs create ${POOL_NAME}/nc_data
zfs create ${POOL_NAME}/doc_index

# Set properties
echo "Setting properties..."
zfs set compression=lz4 ${POOL_NAME}/nc_data
zfs set compression=lz4 ${POOL_NAME}/doc_index

echo "ZFS datasets created successfully."
