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

uniform float F0 = 0.8;
uniform float k = 0.2;
uniform float scene_size = 0;
uniform float light_specular_strength = 1;
uniform float light_diffuse_strength = 1;

uniform vec3 viewPos;

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
		float m_squared = texture(texture_roughness1, TexCoords).x * texture(texture_roughness1, TexCoords).x;
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

vec3 phong( Light light, vec3 diffusein, float roughness,vec3 specularin, vec3 norm, vec3 lightDir, vec3 viewDir){

	vec3 ambients = light.ambient * diffusein;
  	
    // diffuse 

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * (diff * diffusein);
    
    // specular
	//vec3 specular = vec3(1);
    //vec3 reflectDir = reflect(-lightDir, norm); 
	//if(dot(norm, reflectDir)>0.0){
		
	//float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
	//vec3 specular = light.specular * (spec * specularin);  
	//}
	vec3 specular = vec3(0);
	vec3 reflectDir = reflect(-lightDir, norm);  
	if(dot(norm, reflectDir)>0.0){
		float spec = pow(max(dot(viewDir, reflectDir), 0.0),1);

   // vec3 specular = light.specular * spec * specularin; // pow(max(0.0, dot(reflectionDirection, viewDirection))
		specular = specularin * light.specular * spec;
	}
    return  specular+diffuse;

}


void main()
{	
	Light lights[8] = Light[8](
		Light(vec3(scene_size, scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, -scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, -scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, -scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, -scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength))
	);

	FragColor = vec4(0);
	//for(int i =0;i<8;i++){
		Light light = 
			Light(vec3(1,1,1), 
			vec3(0.2, 0.2, 0.2),
			vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
			vec3(light_specular_strength, light_specular_strength, light_specular_strength));


		vec3 norm = normalize(Normal+texture(texture_normal1, TexCoords).x);
		//vec3 norm = normalize(Normal);
		vec3 lightDir = normalize(light.position - FragPos);
		vec3 viewDir = normalize(viewPos - FragPos);
		vec3 diffuse = texture(texture_diffuse1, TexCoords).xyz;
		vec3 specular = texture(texture_specular1, TexCoords).xyz;
		float roughness = texture(texture_roughness1, TexCoords).x;
		//vec3 ct = CookTorrance(diffuse, specular,norm,lightDir,viewDir,light.diffuse);
		vec3 ct = phong( light, diffuse ,roughness,specular, norm, lightDir, viewDir);
		FragColor = vec4(ct, 1.0);

/*		light = lights[0];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[1];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[2];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[3];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[4];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[5];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);

		light = lights[6];
		lightDir = normalize(light.position - FragPos);
		//ct += CookTorrance(texture(texture_diffuse1, TexCoords).xyz, texture(texture_specular1, TexCoords).xyz,norm,lightDir,viewDir,light.diffuse);
		ct += phong( light, texture(texture_diffuse1, TexCoords).xyz,texture(texture_roughness1, TexCoords).x,texture(texture_specular1, TexCoords).xyz, norm, lightDir, viewDir);
		*/
		//FragColor = vec4(ct, 1.0);
		//FragColor = texture(texture_specular1, TexCoords);
	//}

    

} 