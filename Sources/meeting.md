2020 Dec 21 with Dr Deschaintre:

Questions:
1.  what exactly does 3D mean? My understanding is to retrive the texture from a 3D object. if so, that means for training data, I need to use the actual 3D model, so that I can render it with different light source.(creating 3d objects would be very heavy work)
2.  for the training sets, how should I construct it. From your paper, I think it could have lighting sources from anywhere(in this 3D case the sources can vary in the 3D space). Since it is just flashed photo, should be ok with only one direct light source.
3.  paper1(single shot resconstruction): without flash
4.  paper2(2shot reconstruction): one with flash, one without. I think the second one has a lot similarities with my project. 
5.  I am a bit confused about the relation among these two papers and my project. 


Notes:
1. training normal, depth, diffuse, 
2. read the mesh dragon and material


what make our network better

1. generate the dataset with real shapes and brdfs
2. access to computer to train Lixian

flat surface method (tensorflow)
training and load the network 
