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

    vec3 albedo     = pow(texture(texture_diffuse1, TexCoords).rgb, vec3(2.2));
    vec3 color = vec3(0.9) * albedo;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2)); 

    //FragColor = vec4(color, 1.0);
    FragColor = texture(texture_diffuse1, TexCoords);
}