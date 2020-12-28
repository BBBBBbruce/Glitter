#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtx/string_cast.hpp>
#include <glm/gtx/rotate_vector.hpp>
#include <glm/gtc/type_ptr.hpp>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

#include <../Headers/Shader.hpp>
#include <../Headers/Model.hpp>
#include <../Headers/Camera.hpp>



#include <iostream>
#include <string>
#include <filesystem>
#include <vector>

namespace fs = std::filesystem;

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void processInput(GLFWwindow* window);

// settings
const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

// camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = SCR_WIDTH / 2.0f;
float lastY = SCR_HEIGHT / 2.0f;
bool firstMouse = true;

// timing
float deltaTime = 0.0f;
float lastFrame = 0.0f;

//Screenshot taking

Shader ShaderSet(Shader shader) {
    shader.use();

    // view/projection transformations
    glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
    glm::mat4 view = camera.GetViewMatrix();
    //view = glm::translate(view, glm::vec3(2.0f, -2.0f, 2.0f));

    shader.setMat4("projection", projection);
    shader.setMat4("view", view);
    shader.setVec3("viewPos", camera.Position);

    // render the loaded model
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, glm::vec3(0.0f, 0.0f, 0.0f)); // translate it down so it's at the center of the scene
    model = glm::scale(model, glm::vec3(0.4f));	// it's a bit too big for our scene, so scale it down
    //model = glm::rotate(model, 0.785398f, glm::vec3(0.f, 0.2f, 0.5f));

    shader.setMat4("model", model);

    glm::vec3 lightpos = glm::vec3(5.f, 5.f, 10.f);
    shader.setVec3("lightPos", lightpos);
    return shader;
}


int saveScreenshot(string filename)
{
    GLint viewport[4];
    glGetIntegerv(GL_VIEWPORT, viewport);

    int x = viewport[0];
    int y = viewport[1];
    int width = viewport[2];
    int height = viewport[3];

    char* data = (char*)malloc((size_t)(width * height * 3)); // 3 components (R, G, B)



    if (!data)
        return 0;

    glPixelStorei(GL_PACK_ALIGNMENT, 1);
    glReadPixels(x, y, width, height, GL_RGB, GL_UNSIGNED_BYTE, data);
    stbi_flip_vertically_on_write(1);
    int saved = stbi_write_png(filename.c_str(), width, height, 3, data, 0);

    free(data);

    return saved;
}

bool save_screenshot(string filename, int w, int h)
{
    //This prevents the images getting padded 
   // when the width multiplied by 3 is not a multiple of 4
    glPixelStorei(GL_PACK_ALIGNMENT, 1);

    int nSize = w * h * 3;
    // First let's create our buffer, 3 channels per Pixel
    char* dataBuffer = (char*)malloc(nSize * sizeof(char));

    if (!dataBuffer) return false;

    // Let's fetch them from the backbuffer	
    // We request the pixels in GL_BGR format, thanks to Berzeger for the tip
    glReadPixels((GLint)0, (GLint)0,
        (GLint)w, (GLint)h,
        GL_BGR, GL_UNSIGNED_BYTE, dataBuffer);

    //Now the file creation
    FILE* filePtr = fopen(filename.c_str(), "wb");
    if (!filePtr) return false;


    unsigned char TGAheader[12] = { 0,0,2,0,0,0,0,0,0,0,0,0 };
    unsigned char header[6] = { w % 256,w / 256,
                    h % 256,h / 256,
                    24,0 };
    // We write the headers
    fwrite(TGAheader, sizeof(unsigned char), 12, filePtr);
    fwrite(header, sizeof(unsigned char), 6, filePtr);
    // And finally our image data
    fwrite(dataBuffer, sizeof(GLubyte), nSize, filePtr);
    fclose(filePtr);

    free(dataBuffer);

    return true;
}


void save_drawing(Shader shaders[6], string model_name, string outputnames[6], GLFWwindow* window) {

    string path = string("./Glitter/resource/Models/") + model_name + "/" + model_name + ".obj";
    Model model(path.c_str());
    for (int i = 0; i < 6; i++)
    {
        while (!glfwWindowShouldClose(window))
        {
            float currentFrame = glfwGetTime();
            deltaTime = currentFrame - lastFrame;
            lastFrame = currentFrame;
            processInput(window);
            glClearColor(0.05f, 0.05f, 0.05f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            // shading start

            Shader sh = ShaderSet(shaders[i]);
            model.Draw(sh);

            fs::create_directory(string("./Glitter/resource/Out/") + model_name);
            if (saveScreenshot(string("./Glitter/resource/Out/") + model_name + "/" + model_name + outputnames[i])==1)
            {
                cout << "save screenshot successfully" << endl;
                break;
            }
            else
                cout << "save screenshot unsuccessfully" << endl;

            // -------------------------------------------------------------------------------

            glfwSwapBuffers(window);
            glfwPollEvents();
        }

    }

}


int main()
{
    // glfw: initialize and configure
    // ------------------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // glfw window creation
    // --------------------
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "FYP", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback);

    // tell GLFW to capture our mouse
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

    // glad: load all OpenGL function pointers
    // ---------------------------------------
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    // tell stb_image.h to flip loaded texture's on the y-axis (before loading model).
    stbi_set_flip_vertically_on_load(true);

    // configure global opengl state
    // -----------------------------
    glEnable(GL_DEPTH_TEST);


    // loading Shaders and models

    Shader Full("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Full.frag");
    Shader Diffuse("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Diffuse.frag");
    Shader Normal("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Normal.frag");
    Shader Depth("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Depth.frag");
    Shader Specular("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Specular.frag");
    Shader Roughness("./Glitter/Shaders/model_loading.vert", "./Glitter/Shaders/Training_Gen_Roughness.frag");

    Shader shaders[6] = { Full, Diffuse, Normal, Depth, Specular, Roughness };

    string outputnames[6] = { "_Full.png","_Diffuse.png","_Normal.png", "_Depth.png","_Specular.png","_Roughness.png" };

    Model model(std::string("./Glitter/resource/Models/box/box.obj").c_str());
    vector<string> models;

    std::string path = "./Glitter/resource/Models";
    for (const auto& entry : fs::directory_iterator(path)) 
        models.push_back(entry.path().filename().string());
        

    // draw in wireframe
    //glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    // render loop
    // -----------
    for (int i = 0; i < models.size(); i++) {
        save_drawing(shaders, models[i],outputnames,window);
    }

    // glfw: terminate, clearing all previously allocated GLFW resources.
    // ------------------------------------------------------------------    

    glfwTerminate();
    return 0;
}

// process all input: query GLFW whether relevant keys are pressed/released this frame and react accordingly
// ---------------------------------------------------------------------------------------------------------
void processInput(GLFWwindow* window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        camera.ProcessKeyboard(FORWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        camera.ProcessKeyboard(BACKWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        camera.ProcessKeyboard(LEFT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        camera.ProcessKeyboard(RIGHT, deltaTime);
}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
}

// glfw: whenever the mouse moves, this callback is called
// -------------------------------------------------------
void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
    if (firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

    lastX = xpos;
    lastY = ypos;

    camera.ProcessMouseMovement(xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
// ----------------------------------------------------------------------
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(yoffset);
}