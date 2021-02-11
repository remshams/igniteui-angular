import { AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { ElementRef } from '@angular/core';
import { growVerIn, growVerOut } from '../animations/grow';

export interface ToggleAnimationSettings {
    openAnimation: AnimationReferenceMetadata;
    closeAnimation: AnimationReferenceMetadata;
}
export interface ToggleAnimationOwner {
    openAnimationPlayer: AnimationPlayer;
    closeAnimationPlayer: AnimationPlayer;
    animationSettings: ToggleAnimationSettings;
    builder: AnimationBuilder;
}
export abstract class ToggleAnimationComponent {

    public animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    private openAnimationPlayer: AnimationPlayer = null;
    private closeAnimationPlayer: AnimationPlayer = null;

    constructor(protected builder: AnimationBuilder) {
    }

    protected playOpenAnimation(targetElement: ElementRef, callback: () => void, animationOwner?: ToggleAnimationOwner) {
        if (!targetElement) { // if not body element is passed, there is nothing to animate
            return;
        }

        if (!animationOwner) {
            animationOwner = (this as unknown as ToggleAnimationOwner);
        }

        // if no AnimationPlayer is initialized, create one
        if (!animationOwner.openAnimationPlayer) {
            const animation = useAnimation(animationOwner.animationSettings.openAnimation);
            const animationBuilder = animationOwner.builder.build(animation);
            animationOwner.openAnimationPlayer = animationBuilder.create(targetElement.nativeElement);
            animationOwner.openAnimationPlayer.onDone(() => {
                callback();
                animationOwner.openAnimationPlayer.reset();
            });
        }

        // if player has already started, do nothing
        if (animationOwner.openAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is a closing animation already playing, start open animation from where closing has reached
        //  and remove closing animation
        if (animationOwner.closeAnimationPlayer && animationOwner.closeAnimationPlayer.hasStarted()) {
            //  TODO: This assumes opening and closing animations are mirrored.
            const position = 1 - animationOwner.closeAnimationPlayer.getPosition();
            animationOwner.closeAnimationPlayer.reset();
            animationOwner.closeAnimationPlayer = null;
            animationOwner.openAnimationPlayer.init();
            animationOwner.openAnimationPlayer.setPosition(position);
        }

        animationOwner.openAnimationPlayer.play();
    }

    protected playCloseAnimation(targetElement: ElementRef, callback: () => void, animationOwner?: ToggleAnimationOwner) {
        if (!targetElement) { // if not body element is passed, there is nothing to animate
            return;
        }

        if (!animationOwner) {
            animationOwner = (this as unknown as ToggleAnimationOwner);
        }

        // if no AnimationPlayer is initialized, create one
        if (!animationOwner.closeAnimationPlayer) {
            const animation = useAnimation(animationOwner.animationSettings.closeAnimation);
            const animationBuilder = animationOwner.builder.build(animation);
            animationOwner.closeAnimationPlayer = animationBuilder.create(targetElement.nativeElement);
            animationOwner.closeAnimationPlayer.onDone(() => {
                callback();
                animationOwner.closeAnimationPlayer.reset();
            });
        }

        // if player has already started, do nothing
        if (animationOwner.closeAnimationPlayer.hasStarted()) {
            return;
        }

        //  if there is an opening animation already playing, start close animation from where opening has reached
        //  and remove opening animation
        if (animationOwner.openAnimationPlayer && animationOwner.openAnimationPlayer.hasStarted()) {
            //  TODO: This assumes opening and closing animations are mirrored.
            const position = 1 - animationOwner.openAnimationPlayer.getPosition();
            animationOwner.openAnimationPlayer.reset();
            animationOwner.openAnimationPlayer = null;
            animationOwner.closeAnimationPlayer.init();
            animationOwner.closeAnimationPlayer.setPosition(position);
        }

        animationOwner.closeAnimationPlayer.play();
    }
}
