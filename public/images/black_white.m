function imgBW = black_white(img)
for i = 1:size(img,1)
    for j = 1:size(img,2)
        m = round(mean(img(i,j,:)));
        for k = 1:3
            imgBW(i,j,k) = m;
        end
    end
end
imgBW = uint8(imgBW);