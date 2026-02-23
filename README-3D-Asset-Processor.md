# 3D Asset Processor

A comprehensive bash script that combines FBX to GLB conversion and GLB optimization functionality with proper dependency checking and error handling.

## Overview

This script (`3d-asset-processor.sh`) is a combination of the original `fbx-to-glb.sh` and `optimize-glb.sh` scripts, enhanced with:

- Comprehensive dependency checking
- Detailed logging with color-coded output
- Flexible command-line options
- Robust error handling and backup mechanisms
- Comprehensive test suite

## Dependencies

### Required Tools

1. **fbx2gltf** - For FBX to GLB conversion

   ```bash
   npm install -g fbx2gltf
   ```

2. **gltf-transform** - For GLB optimization

   ```bash
   npm install -g gltf-transform/cli@latest
   ```

### Installation

Install both dependencies globally using npm:

```bash
npm install -g fbx2gltf gltf-transform/cli@latest
```

## Usage

### Basic Usage

```bash
# Convert FBX files and optimize GLB files (default behavior)
./3d-asset-processor.sh

# Show help
./3d-asset-processor.sh --help
```

### Command Line Options

| Option | Description |
|--------|-------------|

| `-c, --convert` | Only convert FBX files to GLB |
| `-o, --optimize` | Only optimize existing GLB files |
| `-a, --all` | Perform both conversion and optimization (default) |
| `-h, --help` | Show help message |

### Examples

```bash
# Only convert FBX files to GLB
./3d-asset-processor.sh --convert

# Only optimize existing GLB files
./3d-asset-processor.sh --optimize

# Perform both operations (same as default)
./3d-asset-processor.sh --all

# Show help
./3d-asset-processor.sh --help
```

## Features

### Dependency Checking

The script automatically checks for required executables before attempting operations:

- Validates presence of `fbx2gltf` when conversion is requested
- Validates presence of `gltf-transform` when optimization is requested
- Provides clear installation instructions for missing dependencies

### Error Handling

- **Backup Creation**: Automatically creates backups before optimization
- **Rollback on Failure**: Restores from backup if optimization fails
- **Detailed Logging**: Color-coded output for different message types
- **Exit Codes**: Proper exit codes for success/failure scenarios

### File Processing

- **Recursive Search**: Finds files in current directory and subdirectories
- **Batch Processing**: Processes multiple files in sequence
- **Progress Tracking**: Shows progress for each file being processed
- **Cleanup**: Automatically removes `.fbm` directories after FBX conversion

## Testing

A comprehensive test suite (`test-3d-processor.sh`) is included to verify:

- Dependency detection functionality
- Command-line argument parsing
- Error handling for missing dependencies
- File detection capabilities

### Running Tests

```bash
./test-3d-processor.sh
```

The test suite will:

1. Test help functionality
2. Test dependency detection for missing tools
3. Test invalid option handling
4. Test file detection (when dependencies are available)

## Script Behavior

### FBX Conversion

1. Searches for all `.fbx` files in current directory and subdirectories
2. Converts each FBX file to GLB using `fbx2gltf -b`
3. Cleans up any `.fbm` directories created during conversion
4. Reports success/failure for each file

### GLB Optimization

1. Searches for all `.glb` files in current directory and subdirectories
2. Creates a backup of each file (`filename.backup.glb`)
3. Optimizes using `gltf-transform optimize`
4. Removes backup on success, restores on failure
5. Reports success/failure for each file

## Output Examples

### Success Output

```txt
[INFO] 3D Asset Processor starting in: /path/to/project
[SUCCESS] All required dependencies are available.
[INFO] Starting FBX to GLB conversion...
[INFO] Found 2 FBX file(s) to convert.
[INFO] Converting: model1
[SUCCESS] Successfully converted: model1.fbx → model1.glb
[INFO] Converting: model2
[SUCCESS] Successfully converted: model2.fbx → model2.glb
[INFO] Cleaning up .fbm directories...
[INFO] Conversion complete: 2 successful, 0 failed.
[INFO] Starting GLB optimization...
[INFO] Found 3 GLB file(s) to optimize.
[INFO] Optimizing: model1
[SUCCESS] Successfully optimized: model1.glb
[INFO] Optimizing: model2
[SUCCESS] Successfully optimized: model2.glb
[INFO] Optimizing: existing_model
[SUCCESS] Successfully optimized: existing_model.glb
[INFO] Optimization complete: 3 successful, 0 failed.
[SUCCESS] All operations completed successfully!
```

### Error Output (Missing Dependencies)

```txt
[INFO] 3D Asset Processor starting in: /path/to/project
[ERROR] Missing required dependencies:
  - fbx2gltf: Install with 'npm install -g fbx2gltf'
  - gltf-transform: Install with 'npm install -g gltf-transform'

[ERROR] Please install the missing dependencies and try again.
```

## Migration from Original Scripts

If you were using the original scripts:

- `fbx-to-glb.sh` → `./3d-asset-processor.sh --convert`
- `optimize-glb.sh` → `./3d-asset-processor.sh --optimize`
- Both scripts → `./3d-asset-processor.sh` (default behavior)

The new script provides all the functionality of the original scripts with enhanced error handling, logging, and dependency checking.

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure the script is executable

   ```bash
   chmod +x 3d-asset-processor.sh
   ```

2. **Dependencies Not Found**: Install the required tools

   ```bash
   npm install -g fbx2gltf gltf-transform
   ```

3. **No Files Found**: Ensure you're in the correct directory with FBX/GLB files

### Debug Mode

For debugging, you can run the script with bash debug mode:

```bash
bash -x ./3d-asset-processor.sh
```

## License

This script is provided as-is for use with 3D asset processing workflows.
