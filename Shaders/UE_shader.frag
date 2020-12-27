#version 330 core
out vec4 FragColor;
#define PI 3.14159265


uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular1;
uniform sampler2D texture_normal1;
uniform sampler2D texture_roughness1;


struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

uniform float f0 = 0.8;//0.5-1.0
uniform float k = 0.2;
uniform float scene_size = 1;
uniform float light_specular_strength = 0.9;
uniform float light_diffuse_strength = 0.9;

uniform vec3 viewPos;

void main(){

    FragColor = vec4(1.);
}