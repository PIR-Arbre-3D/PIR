
#include <stdio.h>
#include <stdlib.h>

// code from Darshan Venkatrayappa
#include <CGAL/Simple_cartesian.h>
#include <CGAL/Surface_mesh.h>
#include <CGAL/Surface_mesh/IO/PLY.h>
#include <CGAL/Polygon_mesh_processing/compute_normal.h>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <tiffio.h>
#include <png.h>
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <iomanip>
#include <map>
#include <algorithm>
#include <cmath>
#include <math.h>



// CGAL typedefs
typedef CGAL::Simple_cartesian<double> Kernel;
typedef Kernel::Point_3 Point_3;
typedef Kernel::Vector_3 Vector_3;
typedef CGAL::Surface_mesh<Point_3> Mesh;

// Structure to hold mesh data for OpenGL rendering
struct MeshData {
    std::vector<float> vertices;
    std::vector<float> colors;
    std::vector<unsigned int> indices;
    GLuint VAO, VBO, CBO, EBO;
};

// Structure to hold camera parameters
struct Camera {
    glm::vec3 position;
    glm::vec3 direction;
    glm::vec3 up;
    float fov;
    float near_plane;
    float far_plane;
};

// OpenGL shader sources
const char* vertexShaderSource = R"(
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 FragColor;
out float FragDepth;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    FragColor = aColor;
    FragDepth = gl_Position.z / gl_Position.w;
}
)";

const char* fragmentShaderSource = R"(
#version 330 core
in vec3 FragColor;
in float FragDepth;

layout (location = 0) out vec4 color;
layout (location = 1) out float depth;

void main()
{
    color = vec4(FragColor, 1.0);
    depth = FragDepth;
}
)";

// Global logging function
void logMessage(const std::string& message, std::ofstream& logFile) {
    std::cout << message << std::endl;
    if (logFile.is_open()) {
        logFile << message << std::endl;
    }
}


/**
 * Function to read PLY mesh file using CGAL
 * @param filename: Path to the PLY file
 * @param mesh: Reference to CGAL mesh object to store the data
 * @return: True if successful, false otherwise
 */
bool readPLYMesh(const std::string& filename, Mesh& mesh) {
    std::cout << "Reading PLY file: " << filename << std::endl;

    std::ifstream input(filename);
    if (!input || !CGAL::IO::read_PLY(input, mesh)) {
        std::cerr << "Error: Cannot read PLY file " << filename << std::endl;
        return false;
    }

    std::cout << "Successfully loaded mesh with " << mesh.number_of_vertices()
              << " vertices and " << mesh.number_of_faces() << " faces" << std::endl;
    return true;
}

/**
 * Function to setup OpenGL buffers for mesh rendering
 * @param meshData: Mesh data structure
 */
void setupMeshBuffers(MeshData& meshData) {
    // Generate and bind VAO
    glGenVertexArrays(1, &meshData.VAO);
    glBindVertexArray(meshData.VAO);

    // Generate and setup VBO for vertices
    glGenBuffers(1, &meshData.VBO);
    glBindBuffer(GL_ARRAY_BUFFER, meshData.VBO);
    glBufferData(GL_ARRAY_BUFFER, meshData.vertices.size() * sizeof(float),
                 meshData.vertices.data(), GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Generate and setup CBO for colors
    glGenBuffers(1, &meshData.CBO);
    glBindBuffer(GL_ARRAY_BUFFER, meshData.CBO);
    glBufferData(GL_ARRAY_BUFFER, meshData.colors.size() * sizeof(float),
                 meshData.colors.data(), GL_STATIC_DRAW);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);

    // Generate and setup EBO for indices
    glGenBuffers(1, &meshData.EBO);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, meshData.EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, meshData.indices.size() * sizeof(unsigned int),
                 meshData.indices.data(), GL_STATIC_DRAW);

    glBindVertexArray(0);
}

/**
 * Function to save depth map to TIFF file with proper orientation
 * @param filename: Output filename
 * @param depthData: Depth data array
 * @param width: Image width
 * @param height: Image height
 * @param isNormalized: Whether the depth values are normalized (0-1) or actual meters
 */
void saveDepthToTIFF(const std::string& filename, const std::vector<float>& depthData, std::ofstream &logStream,
                     int width, int height, bool isNormalized) {
    TIFF* tiff = TIFFOpen(filename.c_str(), "w");
    if (!tiff) {
        std::cerr << "Error: Cannot create TIFF file " << filename << std::endl;
        return;
    }

    // Set TIFF tags
    TIFFSetField(tiff, TIFFTAG_IMAGEWIDTH, width);
    TIFFSetField(tiff, TIFFTAG_IMAGELENGTH, height);
    TIFFSetField(tiff, TIFFTAG_SAMPLESPERPIXEL, 1);
    TIFFSetField(tiff, TIFFTAG_BITSPERSAMPLE, 32);
    TIFFSetField(tiff, TIFFTAG_ORIENTATION, ORIENTATION_TOPLEFT);
    TIFFSetField(tiff, TIFFTAG_PLANARCONFIG, PLANARCONFIG_CONTIG);
    TIFFSetField(tiff, TIFFTAG_PHOTOMETRIC, PHOTOMETRIC_MINISBLACK);
    TIFFSetField(tiff, TIFFTAG_SAMPLEFORMAT, SAMPLEFORMAT_IEEEFP);

    // Write data row by row with proper orientation (flipped to match PNG)
    // OpenGL framebuffer is bottom-up, but we want top-down for consistency
    for (int row = 0; row < height; row++) {
        int flippedRow = height - 1 - row; // Flip the row index
        const float* rowData = &depthData[flippedRow * width];
        if (TIFFWriteScanline(tiff, (void*)rowData, row, 0) < 0) {
            std::cerr << "Error writing TIFF scanline " << row << std::endl;
            break;
        }
    }

    TIFFClose(tiff);
    // std::cout << "Saved " << (isNormalized ? "normalized" : "actual")
    //           << " depth map to " << filename << std::endl;

    logMessage(std::string("Saved ") + (isNormalized ? "normalized" : "actual") + " depth map to " + filename , logStream);
}

/**
 * Function to save color image to PNG file using libpng
 * @param filename: Output filename
 * @param colorData: Color data array (RGB)
 * @param width: Image width
 * @param height: Image height
 */
void saveColorToPNG(const std::string& filename, const std::vector<unsigned char>& colorData, std::ofstream &logStream,
                    int width, int height) {
    FILE* fp = fopen(filename.c_str(), "wb");
    if (!fp) {
        std::cerr << "Error: Cannot create PNG file " << filename << std::endl;
        return;
    }

    png_structp png = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    if (!png) {
        std::cerr << "Error: Cannot create PNG write struct" << std::endl;
        fclose(fp);
        return;
    }

    png_infop info = png_create_info_struct(png);
    if (!info) {
        std::cerr << "Error: Cannot create PNG info struct" << std::endl;
        png_destroy_write_struct(&png, NULL);
        fclose(fp);
        return;
    }

    if (setjmp(png_jmpbuf(png))) {
        std::cerr << "Error: PNG write error" << std::endl;
        png_destroy_write_struct(&png, &info);
        fclose(fp);
        return;
    }

    png_init_io(png, fp);

    // Set PNG header
    png_set_IHDR(png, info, width, height, 8, PNG_COLOR_TYPE_RGB,
                 PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);

    png_write_info(png, info);

    // Prepare row pointers (PNG expects data from top to bottom)
    std::vector<png_bytep> row_pointers(height);
    for (int y = 0; y < height; y++) {
        // Note: OpenGL framebuffer data is bottom-up, so we flip it
        row_pointers[y] = (png_bytep)&colorData[(height - 1 - y) * width * 3];
    }

    png_write_image(png, row_pointers.data());
    png_write_end(png, NULL);

    png_destroy_write_struct(&png, &info);
    fclose(fp);

    //std::cout << "Saved color image to " << filename << std::endl;
    logMessage("Saved color image to " + filename + "\n", logStream);
}

/**
 * Function to convert CGAL mesh to OpenGL-compatible format
 * @param mesh: Input CGAL mesh
 * @param meshData: Output OpenGL mesh data structure
 */
void convertMeshToOpenGL(const Mesh& mesh, MeshData& meshData) {
    std::cout << "Converting mesh to OpenGL format..." << std::endl;

    // Clear existing data
    meshData.vertices.clear();
    meshData.colors.clear();
    meshData.indices.clear();

    // debug
/*
    float minx = FLT_MAX;
    float maxx = -FLT_MAX;
    float miny = FLT_MAX;
    float maxy = -FLT_MAX;
*/
    // Extract vertices and colors
    for (auto v : mesh.vertices()) {
        Point_3 point = mesh.point(v);
        meshData.vertices.push_back(static_cast<float>(point.x()));
        meshData.vertices.push_back(static_cast<float>(point.y()));
        meshData.vertices.push_back(static_cast<float>(point.z()));
/*
        if (minx > static_cast<float>(point.x())) minx = static_cast<float>(point.x());
        if (maxx < static_cast<float>(point.x())) maxx = static_cast<float>(point.x());
        if (miny > static_cast<float>(point.y())) miny = static_cast<float>(point.y());
        if (maxy < static_cast<float>(point.y())) maxy = static_cast<float>(point.y());
*/
        // Check if mesh has color property
        auto color_map = mesh.property_map<Mesh::Vertex_index, CGAL::IO::Color>("v:color");
        if (color_map.second) {
            auto color = color_map.first[v];
            meshData.colors.push_back(color.red() / 255.0f);
            meshData.colors.push_back(color.green() / 255.0f);
            meshData.colors.push_back(color.blue() / 255.0f);
        } else {
            // Default white color if no color information
            meshData.colors.push_back(0.8f);
            meshData.colors.push_back(0.8f);
            meshData.colors.push_back(0.8f);
        }
    }

    //std::cout << "X min max : " << minx << " " << maxx << std::endl;
    //std::cout << "y min max : " << miny << " " << maxy << std::endl;

    // Extract face indices
    for (auto f : mesh.faces()) {
        auto halfedge = mesh.halfedge(f);
        auto v1 = mesh.target(halfedge);
        auto v2 = mesh.target(mesh.next(halfedge));
        auto v3 = mesh.target(mesh.next(mesh.next(halfedge)));

        meshData.indices.push_back(static_cast<unsigned int>(v1));
        meshData.indices.push_back(static_cast<unsigned int>(v2));
        meshData.indices.push_back(static_cast<unsigned int>(v3));
    }

    std::cout << "Converted " << meshData.vertices.size()/3 << " vertices and "
              << meshData.indices.size()/3 << " faces" << std::endl;
}

/**
 * Function to compile OpenGL shader
 * @param source: Shader source code
 * @param type: Shader type (GL_VERTEX_SHADER or GL_FRAGMENT_SHADER)
 * @return: Compiled shader ID
 */
GLuint compileShader(const char* source, GLenum type) {
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &source, NULL);
    glCompileShader(shader);

    // Check compilation status
    GLint success;
    GLchar infoLog[512];
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(shader, 512, NULL, infoLog);
        std::cerr << "Shader compilation failed: " << infoLog << std::endl;
    }

    return shader;
}

/**
 * Function to create and link shader program
 * @return: Shader program ID
 */
GLuint createShaderProgram() {
    GLuint vertexShader = compileShader(vertexShaderSource, GL_VERTEX_SHADER);
    GLuint fragmentShader = compileShader(fragmentShaderSource, GL_FRAGMENT_SHADER);

    GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);

    // Check linking status
    GLint success;
    GLchar infoLog[512];
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
        std::cerr << "Shader program linking failed: " << infoLog << std::endl;
    }

    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    return shaderProgram;
}

void printMat4(const glm::mat4& m)
{
    for (int r = 0; r < 4; r++) {
        std::cout << "[ ";
        for (int c = 0; c < 4; c++) {
            std::cout << m[c][r] << " ";  // GLM is column-major
        }
        std::cout << "]\n";
    }
}

std::vector<float> renderDepthAndColorWithReturn(const Mesh& mesh, std::string meshFile, const Camera& camera, float fov, const bool& save_rays_points, const std::string outputDir,
    std::ofstream &logStream, int width = 1024, int height = 1024)
{
    std::cout << "\n ";
    std::cout << "Starting OpenGL rendering for " << meshFile << "..." << std::endl;

    // Initialize GLFW
    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW" << std::endl;
        return std::vector<float>();
    }

    // Create offscreen context
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);

    GLFWwindow* window = glfwCreateWindow(width, height, "Offscreen", NULL, NULL);
    if (!window) {
        std::cerr << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return std::vector<float>();
    }

    glfwMakeContextCurrent(window);

    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW" << std::endl;
        glfwTerminate();
        return std::vector<float>();
    }

    // Setup framebuffer for offscreen rendering
    GLuint framebuffer, colorTexture, depthTexture;

    glGenFramebuffers(1, &framebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);

    // Color attachment
    glGenTextures(1, &colorTexture);
    glBindTexture(GL_TEXTURE_2D, colorTexture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, colorTexture, 0);

    // Depth texture
    glGenTextures(1, &depthTexture);
    glBindTexture(GL_TEXTURE_2D, depthTexture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT32F, width, height, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthTexture, 0);

    GLenum drawBuffers[1] = {GL_COLOR_ATTACHMENT0};
    glDrawBuffers(1, drawBuffers);

    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
        std::cerr << "Framebuffer not complete!" << std::endl;
        glfwTerminate();
        return std::vector<float>();
    }

    // Convert mesh to OpenGL format
    MeshData meshData;
    convertMeshToOpenGL(mesh, meshData);
    setupMeshBuffers(meshData);

    // Create shader program
    GLuint shaderProgram = createShaderProgram();

    // Setup matrices
    glm::mat4 model = glm::mat4(1.0f);
    glm::mat4 view = glm::lookAt(camera.position, camera.position + camera.direction, camera.up);
    glm::mat4 projection = glm::perspective(glm::radians(fov),
                        static_cast<float>(width) / height,
                        camera.near_plane, camera.far_plane);

    // debug
    //printMat4(view);
    //printMat4(projection);

    // Render
    glViewport(0, 0, width, height);
    glEnable(GL_DEPTH_TEST);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glUseProgram(shaderProgram);

    // Set uniforms
    glUniformMatrix4fv(glGetUniformLocation(shaderProgram, "model"), 1, GL_FALSE, glm::value_ptr(model));
    glUniformMatrix4fv(glGetUniformLocation(shaderProgram, "view"), 1, GL_FALSE, glm::value_ptr(view));
    glUniformMatrix4fv(glGetUniformLocation(shaderProgram, "projection"), 1, GL_FALSE, glm::value_ptr(projection));

    // Render mesh
    glBindVertexArray(meshData.VAO);
    glDrawElements(GL_TRIANGLES, meshData.indices.size(), GL_UNSIGNED_INT, 0);

    // Read back color data
    std::vector<unsigned char> colorData(width * height * 3);
    glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, colorData.data());

    // Read depth data from depth buffer
    std::vector<float> depthData(width * height);
    glReadPixels(0, 0, width, height, GL_DEPTH_COMPONENT, GL_FLOAT, depthData.data());

    // Convert depth buffer values to linear depth in world space
    std::vector<float> linearDepth(width * height);
    std::vector<float> normalizedDepth(width * height);

    for (int i = 0; i < width * height; i++) {
        //OpenGL's clip space uses Z in the range [-1, 1] for perspective projections (in NDC).
        // But the depth buffer stores it in [0, 1] for practical reasons (e.g., unsigned int formats).
        float depthBuffer = depthData[i];
        float ndc = 2.0f * depthBuffer - 1.0f;    //converts from [0, 1] (depth buffer) → [-1, 1] (NDC Z), which matches the clip-space Z/W value before perspective division.
        float linearZ = (2.0f * camera.near_plane * camera.far_plane) /
        (camera.far_plane + camera.near_plane - ndc * (camera.far_plane - camera.near_plane));

        linearDepth[i] = linearZ;
        normalizedDepth[i] = (linearZ - camera.near_plane) / (camera.far_plane - camera.near_plane);
    }

    // Save results only if save_rays_points is true
    if (save_rays_points) {
        size_t lastSlash = meshFile.find_last_of("/\\");
        std::string meshFile_1 = (lastSlash == std::string::npos) ? meshFile : meshFile.substr(lastSlash + 1);
        size_t lastDot = meshFile_1.find_last_of('.');
        meshFile_1 = (lastDot == std::string::npos) ? meshFile_1 : meshFile_1.substr(0, lastDot);
        meshFile_1 = outputDir + meshFile_1;

        std::string normalized_depth_file = meshFile_1 + "_" + "normalised_depthmap.tiff";
        std::string actual_depth_file = meshFile_1 + "_" + "actual_depthmap.tiff";
        std::string color_image_file = meshFile_1 + "_" + "color_image.png";

        saveDepthToTIFF(normalized_depth_file, normalizedDepth, logStream, width, height, true);
        saveDepthToTIFF(actual_depth_file, linearDepth, logStream, width, height, false);
        saveColorToPNG(color_image_file, colorData, logStream, width, height);


    }

    // Cleanup
    glDeleteFramebuffers(1, &framebuffer);
    glDeleteTextures(1, &colorTexture);
    glDeleteTextures(1, &depthTexture);
    glDeleteProgram(shaderProgram);

    glfwTerminate();

    std::cout << "Rendering completed for " << meshFile << std::endl;
    return linearDepth;
}

// refer to https://learnopengl.com/Advanced-OpenGL/Depth-testing
// for the PIR2025, only camera position and orientation is needed
int main(int argc, char const *argv[])
{
    //char LIDARFile[512] = "../Data/LIDAR_MESH_1M.ply";
    char LIDARFile[512] = "C:/__DepthMap/InputMD/modele.ply";

	// parameter
	const int WIDTH = 1024;
    const int HEIGHT = 1024;
    const float nearPlaneDefault = 1800.000000f;
    const float farPlaneDefault = 2000.000000f;
    const std::string outputDir = "C:/__DepthMap/OutputMD/";
    const std::string logFile = outputDir + "log.txt";
    float fov = 3;

    std::ofstream logStream(logFile);
    if (!logStream.is_open()) {
        std::cerr << "Error: Cannot create log file : " << logFile << std::endl;
        return -1;
    }

	// step 1 : camera

	// Setup camera with proper coordinate system handling
    Camera camera;

    // from the center mesh and look down from the air
    //camera.position = glm::vec3(623.044, -412.727, 500.67566);
    //camera.position = glm::vec3(-5, 0, 1970); ou -15
    //camera.direction = glm::vec3(0, 0, -1); 
    const float angle = 15;
    const float angleRad = angle * 3.14159265 / 180;
    camera.position = glm::vec3(sin(angleRad) * 1970, 0, cos(angleRad) * 1970);
    camera.direction = glm::vec3(-sin(angleRad), 0, -cos(angleRad));

    // Calculate proper up vector based on the normal direction
    glm::vec3 worldUp = glm::vec3(0, 0, 1); // Z-up world coordinate
    //glm::vec3 worldUp = ComputeUpVector(camera.direction);

    glm::vec3 right = glm::cross(camera.direction, worldUp);
    if (glm::length(right) < 1e-6f) {
        worldUp = glm::vec3(0,1,0); // pick Y-up instead
        right = glm::cross(camera.direction, worldUp);
    }
    right = glm::normalize(right);
    camera.up = glm::normalize(glm::cross(right, camera.direction));
/*
    std::cout << camera.up[0] << " " << camera.up[1] << " " << camera.up[2]<< std::endl;
    std::cout << " After " << std::endl;
*/
    // If the normal is too close to vertical, use Y-up as fallback
    if (glm::length(right) < 0.01f) {
        worldUp = glm::vec3(0.0f, 1.0f, 0.0f);
        //glm::vec3 worldUp = ComputeUpVector(camera.direction);

        right = glm::normalize(glm::cross(camera.direction, worldUp));
        camera.up = glm::normalize(glm::cross(right, camera.direction));
    }
/*
    std::cout << camera.position[0] << " " << camera.position[1] << " " << camera.position[2]<< std::endl;
    std::cout << camera.direction[0] << " " << camera.direction[1] << " " << camera.direction[2]<< std::endl;
    std::cout << camera.up[0] << " " << camera.up[1] << " " << camera.up[2]<< std::endl;
*/
    camera.fov = fov;
    camera.near_plane = nearPlaneDefault;
    camera.far_plane = farPlaneDefault;

	// Step 2: Load photogrametric mesh
    Mesh LIDARMesh;
    if (!readPLYMesh(LIDARFile, LIDARMesh)) {
        return -1;
    }

    // Step 3: Render depth map and color image of the photogrametric mesh
    std::vector<float> photogrametricDepth = renderDepthAndColorWithReturn(LIDARMesh, LIDARFile, camera, fov, true, outputDir, logStream, WIDTH, HEIGHT);

	return 0;
}
