#version 330 core
out vec4 FragColor;

uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular1;
uniform sampler2D texture_normal1;
uniform sampler2D texture_roughness1;

in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

void main()
{	
    FragColor = texture(texture_normal1, TexCoords);
}