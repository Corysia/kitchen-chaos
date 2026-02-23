#!/bin/bash

# 3D Asset Processor Script
# 
# This script combines FBX to GLB conversion and GLB optimization functionality.
# It can convert FBX files to GLB format and/or optimize existing GLB files.
#
# Dependencies:
# - fbx2gltf: For FBX to GLB conversion (npm install -g fbx2gltf)
# - gltf-transform: For GLB optimization (npm install -g gltf-transform)
#
# Usage:
#   ./3d-asset-processor.sh [options]
#   
# Options:
#   -c, --convert     Convert FBX files to GLB
#   -o, --optimize    Optimize existing GLB files
#   -a, --all         Perform both conversion and optimization (default)
#   -h, --help        Show this help message
#
# Examples:
#   ./3d-asset-processor.sh --convert      # Only convert FBX files
#   ./3d-asset-processor.sh --optimize     # Only optimize GLB files
#   ./3d-asset-processor.sh --all          # Convert and optimize
#   ./3d-asset-processor.sh                 # Convert and optimize (default)

set -e  # Exit on error

# Default behavior
CONVERT_FBX=true
OPTIMIZE_GLB=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display help
show_help() {
    cat << 'EOF'
3D Asset Processor Script

This script combines FBX to GLB conversion and GLB optimization functionality.

Dependencies:
- fbx2gltf: For FBX to GLB conversion (npm install -g fbx2gltf)
- gltf-transform: For GLB optimization (npm install -g gltf-transform)

Usage:
  $0 [options]

Options:
  -c, --convert     Convert FBX files to GLB
  -o, --optimize    Optimize existing GLB files
  -a, --all         Perform both conversion and optimization (default)
  -h, --help        Show this help message

Examples:
  $0 --convert      # Only convert FBX files
  $0 --optimize     # Only optimize GLB files
  $0 --all          # Convert and optimize
  $0                # Convert and optimize (default)

EOF
}

# Function to check if required executables are present
check_dependencies() {
    local missing_deps=()
    
    if [ "$CONVERT_FBX" = true ]; then
        if ! command -v fbx2gltf &> /dev/null; then
            missing_deps+=("fbx2gltf")
        fi
    fi
    
    if [ "$OPTIMIZE_GLB" = true ]; then
        if ! command -v gltf-transform &> /dev/null; then
            missing_deps+=("gltf-transform")
        fi
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "fbx2gltf")
                    echo "  - fbx2gltf: Install with 'npm install -g fbx2gltf'"
                    ;;
                "gltf-transform")
                    echo "  - gltf-transform: Install with 'npm install -g gltf-transform'"
                    ;;
            esac
        done
        echo
        log_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    log_success "All required dependencies are available."
}

# Function to convert FBX files to GLB
convert_fbx_to_glb() {
    log_info "Starting FBX to GLB conversion..."
    
    local fbx_files=()
    while IFS= read -r -d '' file; do
        fbx_files+=("$file")
    done < <(find "$CURRENT_DIR" -name "*.fbx" -type f -print0)
    
    if [ ${#fbx_files[@]} -eq 0 ]; then
        log_warning "No FBX files found in current directory."
        return 0
    fi
    
    log_info "Found ${#fbx_files[@]} FBX file(s) to convert."
    
    local converted_count=0
    local failed_count=0
    
    for fbx_file in "${fbx_files[@]}"; do
        local filename=$(basename "$fbx_file" .fbx)
        local file_dir=$(dirname "$fbx_file")
        
        log_info "Converting: $filename"
        
        # Change to the file's directory for conversion
        cd "$file_dir"
        
        # Convert FBX to GLB
        if fbx2gltf -b -i "$(basename "$fbx_file")" -o "$filename" 2>/dev/null; then
            log_success "Successfully converted: $filename.fbx → $filename.glb"
            ((converted_count++))
        else
            log_error "Failed to convert: $filename.fbx"
            ((failed_count++))
        fi
        
        # Return to original directory
        cd "$CURRENT_DIR"
    done
    
    # Clean up .fbm directories
    log_info "Cleaning up .fbm directories..."
    find "$CURRENT_DIR" -name "*.fbm" -type d | while read -r fbm_dir; do
        log_info "Removing: $(basename "$fbm_dir")"
        rm -rf "$fbm_dir"
    done
    
    log_info "Conversion complete: $converted_count successful, $failed_count failed."
    
    if [ $failed_count -gt 0 ]; then
        return 1
    fi
}

# Function to optimize GLB files
optimize_glb_files() {
    log_info "Starting GLB optimization..."
    
    local glb_files=()
    while IFS= read -r -d '' file; do
        glb_files+=("$file")
    done < <(find "$CURRENT_DIR" -name "*.glb" -type f -print0)
    
    if [ ${#glb_files[@]} -eq 0 ]; then
        log_warning "No GLB files found in current directory."
        return 0
    fi
    
    log_info "Found ${#glb_files[@]} GLB file(s) to optimize."
    
    local optimized_count=0
    local failed_count=0
    
    for glb_file in "${glb_files[@]}"; do
        local filename=$(basename "$glb_file" .glb)
        local backup_file="$filename.backup.glb"
        
        log_info "Optimizing: $filename"
        
        # Create backup
        cp "$glb_file" "$backup_file"
        
        # Optimize GLB file
        if gltf-transform optimize "$glb_file" "$glb_file" 2>/dev/null; then
            log_success "Successfully optimized: $filename.glb"
            rm "$backup_file"  # Remove backup if successful
            ((optimized_count++))
        else
            log_error "Failed to optimize: $filename.glb"
            mv "$backup_file" "$glb_file"  # Restore from backup
            ((failed_count++))
        fi
    done
    
    log_info "Optimization complete: $optimized_count successful, $failed_count failed."
    
    if [ $failed_count -gt 0 ]; then
        return 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--convert)
            CONVERT_FBX=true
            OPTIMIZE_GLB=false
            shift
            ;;
        -o|--optimize)
            CONVERT_FBX=false
            OPTIMIZE_GLB=true
            shift
            ;;
        -a|--all)
            CONVERT_FBX=true
            OPTIMIZE_GLB=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Get current directory
CURRENT_DIR=$(pwd)

log_info "3D Asset Processor starting in: $CURRENT_DIR"

# Check dependencies before proceeding
check_dependencies

# Track overall success
overall_success=true

# Perform conversion if requested
if [ "$CONVERT_FBX" = true ]; then
    if ! convert_fbx_to_glb; then
        overall_success=false
    fi
fi

# Perform optimization if requested
if [ "$OPTIMIZE_GLB" = true ]; then
    if ! optimize_glb_files; then
        overall_success=false
    fi
fi

# Final status
if [ "$overall_success" = true ]; then
    log_success "All operations completed successfully!"
    exit 0
else
    log_error "Some operations failed. Please check the output above."
    exit 1
fi
