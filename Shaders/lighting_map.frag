#version 330 core
out vec4 FragColor;
#define PI 3.14159265

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;
    sampler2D roughness;
    sampler2D displacement;
}; 

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

uniform float F0 = 0.8;
uniform float k = 0.2;
  
uniform vec3 viewPos;
uniform Material material;
uniform Light light;

vec3 CookTorrance(vec3 materialDiffuseColor,
	vec3 materialSpecularColor,
	vec3 normal,
	vec3 lightDir,
	vec3 viewDir,
	vec3 lightColor)
{
	float NdotL = max(0, dot(normal, lightDir));
	float Rs = 0.0;
	if (NdotL > 0) 
	{
		vec3 H = normalize(lightDir + viewDir);
		float NdotH = max(0, dot(normal, H));
		float NdotV = max(0, dot(normal, viewDir));
		float VdotH = max(0, dot(lightDir, H));

		// Fresnel reflectance
		float F = pow(1.0 - VdotH, 5.0);
		F *= (1.0 - F0);
		F += F0;

		// Microfacet distribution by Beckmann
		float m_squared = texture(material.roughness, TexCoords).x * texture(material.roughness, TexCoords).x;
		float r1 = 1.0 / (4.0 * m_squared * pow(NdotH, 4.0));
		float r2 = (NdotH * NdotH - 1.0) / (m_squared * NdotH * NdotH);
		float D = r1 * exp(r2);

		// Geometric shadowing
		float two_NdotH = 2.0 * NdotH;
		float g1 = (two_NdotH * NdotV) / VdotH;
		float g2 = (two_NdotH * NdotL) / VdotH;
		float G = min(1.0, min(g1, g2));

		Rs = (F * D * G) / (PI * NdotL * NdotV);
	}
	return materialDiffuseColor * lightColor * NdotL + lightColor * materialSpecularColor * NdotL * (k + Rs * (1.0 - k));
}



void main()
{
   
    vec3 norm = normalize(Normal+texture(material.normal, TexCoords).x);
    vec3 lightDir = normalize(light.position - FragPos);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 ct = CookTorrance(texture(material.diffuse, TexCoords).xyz, texture(material.specular, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
    FragColor = vec4(ct, 1.0);
} 