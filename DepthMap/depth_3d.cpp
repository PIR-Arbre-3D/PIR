
#include <stdio.h>
#include <stdlib.h>

#include <vector>
#include <iostream>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <math.h>

#include <tiffio.h>

bool readDepthTIFF(const std::string filename, std::vector<float>& depthData, int & width, int &height)
{
    TIFF* tiff = TIFFOpen(filename.c_str(), "r");
    if (!tiff) {
        std::cout << "Error: Cannot open TIFF file " << filename << std::endl;
        return false;
    }

    uint32 w, h;
    uint16 bitsPerSample, samplesPerPixel, sampleFormat;

    // Read metadata
    TIFFGetField(tiff, TIFFTAG_IMAGEWIDTH, &w);
    TIFFGetField(tiff, TIFFTAG_IMAGELENGTH, &h);
    TIFFGetField(tiff, TIFFTAG_BITSPERSAMPLE, &bitsPerSample);
    TIFFGetField(tiff, TIFFTAG_SAMPLESPERPIXEL, &samplesPerPixel);
    TIFFGetField(tiff, TIFFTAG_SAMPLEFORMAT, &sampleFormat);

    // Validate properties
    if (bitsPerSample != 32 || samplesPerPixel != 1 || sampleFormat != SAMPLEFORMAT_IEEEFP) {
        std::cout << "Error: Unexpected TIFF pixel format in " << filename << std::endl;
        TIFFClose(tiff);
        return false;
    }

    width = static_cast<int>(w);
    height = static_cast<int>(h);

    depthData.resize(width * height);

    // Buffer for one scanline
    std::vector<float> scanline(width);

    // TIFF stored top-down because your write code uses ORIENTATION_TOPLEFT
    for (int row = 0; row < height; ++row) {
        if (TIFFReadScanline(tiff, scanline.data(), row, 0) < 0) {
            std::cout << "Error reading TIFF scanline " << row << std::endl;
            TIFFClose(tiff);
            return false;
        }

        // Copy into output buffer
        std::memcpy(&depthData[row * width], scanline.data(), width * sizeof(float));
    }

    TIFFClose(tiff);
    return true;
}

// refer to https://learnopengl.com/Advanced-OpenGL/Depth-testing
int main(int argc, char const *argv[])
{
    // set the camera
    char szTiff[512] = "C:/__DepthMap/InputD3/modele_actual_depthmap.tiff";

    std::vector<float>  depthData;
    int width = 0;
    int height = 0;
    readDepthTIFF(szTiff, depthData, width, height);

    float fov = 3;
    const float nearPlaneDefault = 1800.000000f;
    const float farPlaneDefault = 2000.000000f;

    //glm::vec3 position = glm::vec3(15, 1970, 0);
    //glm::vec3 direction = glm::vec3(0, -1, 0);
    //glm::vec3 position = glm::vec3(171.7, 0, 1962.5);
    //glm::vec3 direction = glm::vec3(-0.087, 0, -0.996);
    glm::vec3 up = glm::vec3(0, 0, 1);

    const float angle = 15;
    const float angleRad = angle * 3.14159265 / 180;
    glm::vec3 position = glm::vec3(sin(angleRad) * 1970, 0, cos(angleRad) * 1970);
    glm::vec3 direction = glm::vec3(-sin(angleRad), 0, -cos(angleRad));

    glm::mat4 model = glm::mat4(1.0f);
    glm::mat4 view = glm::lookAt(position, position + direction, up);
    glm::mat4 projection = glm::perspective(glm::radians(fov),
                                            static_cast<float>(width) / height,
                                            nearPlaneDefault,
                                            farPlaneDefault);



     // 2. Compute inverse of Projection * View
    glm::mat4 invPV = glm::inverse(projection * view);

    std::vector<glm::vec3> pointcloud;
    for (int i = 0; i < height; ++i){
        for (int j = 0; j < width; ++j){
            float depth = depthData[i  * width + j];
            //std::cout << depth << " ";
            if (depth < farPlaneDefault){

                // 1. Convert pixel to Normalized Device Coordinates (NDC)
                float ndc_x = (2.0f * j) / width - 1.0f;
                float ndc_y = 1.0f - (2.0f * i) / height; // flip y because OpenGL origin is bottom-left

                // normalized
                depth = (1.0/depth - 1.0/nearPlaneDefault) / (1.0/farPlaneDefault - 1.0/nearPlaneDefault);
                float ndc_z = depth * 2.0f - 1.0f;
                glm::vec4 ndcPos(ndc_x, ndc_y, ndc_z, 1.0f);

                // 3. Transform from NDC to world space
                glm::vec4 worldPos = invPV * ndcPos;

                // 4. Divide by w to get 3D coordinates
                glm::vec3 worldPoint = glm::vec3(worldPos) / worldPos.w;

                pointcloud.push_back(worldPoint);
            }
        }
    }

    std::cout << "point number : " << pointcloud.size() << std::endl;

    // set the camera
    char szTxt[512] = "C:/__DepthMap/OutputD3/modele_point_cloud.txt";
    /*strcpy(szTxt, szTiff);
    strcpy(strrchr(szTxt, '.'), ".txt");*/

    FILE * fp = fopen(szTxt, "w");
    for (int i = 0; i < pointcloud.size(); ++i){
        fprintf(fp, "%10.3lf %10.3lf %10.3lf\n", pointcloud[i][0], pointcloud[i][1], pointcloud[i][2]);
    }
    fclose(fp);

    return 0;
}
