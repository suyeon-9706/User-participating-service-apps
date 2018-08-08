package com.project.bottomup.upsa;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.Toast;

public class AddCafeFragment extends Fragment{
    private CheckBox cb1; //화장실
    private CheckBox cb1_1; //휴지
    private CheckBox cb1_2; //남녀공용

    private CheckBox cb2; //주차 공간
    private CheckBox cb2_1; //유료? 무료?

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View rootView = inflater.inflate(R.layout.fragment_add_cafe, container, false);
        Log.i("AddCafe","OnCreateView");

        cb1 = (CheckBox)rootView.findViewById(R.id.cafe_1);
        cb1_1 = (CheckBox)rootView.findViewById(R.id.cafe1_1);
        cb1_2 = (CheckBox)rootView.findViewById(R.id.cafe1_2);

        cb2 = (CheckBox)rootView.findViewById(R.id.cafe_2);
        cb2_1 = (CheckBox)rootView.findViewById(R.id.cafe2_1);

        final CheckBox[] toilet = {cb1,cb1_1,cb1_2};
        final CheckBox[] parking = {cb2,cb2_1};

        //화장실에 대한 세부 정보 체크
        cb1.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    for(int i=0;i<toilet.length;i++){
                        toilet[i].setVisibility(View.VISIBLE);
                    }
                }else{
                    for(int i=1;i<toilet.length;i++){
                        toilet[i].setChecked(false);
                        toilet[i].setVisibility(View.GONE);
                    }
                }
            }
        });

        //주차 공간에 대한 세부 정보 체크
        cb2.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    for(int i=1; i<parking.length;i++){
                        parking[i].setVisibility(View.VISIBLE);
                    }
                }else{
                    for(int i=1; i<parking.length;i++){
                        parking[i].setChecked(false);
                        parking[i].setVisibility(View.GONE);
                    }
                }
            }
        });

        //메뉴 추가 버튼 클릭했을 때 이벤트
        Button button_c1 = (Button) rootView.findViewById(R.id.cafe_btn1);
        button_c1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //다이어로그
                Log.i("AddCafe","addmenu_click");
                AddMenuFragment dialog = AddMenuFragment.newInstance(new AddMenuFragment.MenuInputListener() {
                    @Override
                    public void onMenuInputComplete(String name, String price) {
                        if(name!=null){
                            Log.i("AddCafe","addmenu_click_success");
                            Toast.makeText(getActivity(),"name은"+name+", price는"+price,Toast.LENGTH_LONG).show();
                        }
                    }
                });
                dialog.show(getFragmentManager(), "menu");
            }
        });

        //다음 프래그먼트로 넘어가게 하는 이벤트(리뷰 등록)
        Button button2 = (Button) rootView.findViewById(R.id.button2);
        button2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //프래그먼트 교체
                Log.i("AddCafe","button_click");
                ((FragmentReplacable) getActivity()).replaceFragment("review");
            }
        });
        return rootView;
    }
}
