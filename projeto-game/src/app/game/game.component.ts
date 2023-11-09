import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  constructor(private route: ActivatedRoute) { }

  playSound(audioName: string) {
    let audio = new Audio(`../../assets/audios/${audioName}.m4a`)
    if(audioName == 'hit') {
      audio.volume = 0.1
    } else if (audioName == 'hurt'){
      audio.volume = 0.6
    } else {
      audio.volume = 0.4
    }
    audio.play()
  }

  removeEnemy(state: any) {
    state.view.squares.forEach((square:any) => {
      square.classList.remove("enemy")
    })
  }

  randomEnemyPosition(state: any) {
    this.removeEnemy(state)
    let randomNumber = Math.floor(Math.random() * 9)
    while(randomNumber === state.values.enemyPosition) {
      randomNumber = Math.floor(Math.random() * 9)
    }
    let randomSquare = state.view.squares[randomNumber]
    randomSquare.classList.add("enemy")
    state.values.enemyPosition = randomSquare.id
  }

  moveEnemy(state: any) {
    state.values.timeId = setInterval(() => {
      this.randomEnemyPosition(state)
    }, state.values.gameVelocity)
  }

  addListenerHitbox(state: any) {
    state.view.squares.forEach((square: any) => {
      square.addEventListener("mousedown", () => {
        if(square.id === state.values.enemyPosition) {
          state.values.result++
          this.playSound('hit')
          state.values.enemyPosition = null
          this.removeEnemy(state)
          state.view.score.textContent = state.values.result
        } else {
          this.removeLife(state)
        }
      })
    })
  }

  timeCoundown(state: any) {
    state.values.timeIntervalId = setInterval(() => {
      if (state.values.currentTime > 0) {
        state.values.currentTime--
        state.view.timeLeft.textContent = state.values.currentTime
      }else {
        this.removeEnemy(state)
        this.playSound('lost')
        state.view.gameOverText.textContent = `Seu tempo acabou. \nSeu resultado foi ${state.values.result}`
        clearInterval(state.values.timeIntervalId)
        clearInterval(state.values.moveTimerId)
        state.view.gameOver.classList.remove("hidden")
      }
    }, state.values.gameVelocity)
  }

  removeLife(state: any) {
    if (state.values.remainingLifes > 0) {
      this.playSound('hurt')
      state.values.remainingLifes--
      state.view.lifes.textContent = `x${state.values.remainingLifes}`
    } else {
      this.playSound('lost')
      state.view.gameOverText.textContent = `Suas vidas acabaram. \nSeu resultado foi ${state.values.result}`
      clearInterval(state.values.timeIntervalId)
      clearInterval(state.values.moveTimerId)
      state.view.gameOver.classList.remove("hidden")
    }
  }

  setDificulty(state: any) {
    if(this.route.snapshot.paramMap.get('dificulty') === 'easy') {
      state.values.gameVelocity = 1300
    } else if(this.route.snapshot.paramMap.get('dificulty') === 'medium') {
      state.values.gameVelocity = 1000
    } else {
      state.values.gameVelocity = 500
    }
  }

  ngAfterViewInit() {
    const state = {
      view: {
        squares: document.querySelectorAll('.panel__col__square'),
        enemy: document.querySelector(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        lifes: document.querySelector("#lifes"),
        gameOverText: document.querySelector("#game-over-text"),
        gameOver: document.querySelector(".game-over")
      },
      values: {
        moveTimerId: null,
        timeIntervalId: null,
        gameVelocity: 1000,
        enemyPosition: 0,
        result: 0,
        currentTime: 60,
        remainingLifes: 3
      }
    }

    this.setDificulty(state)
    this.moveEnemy(state)
    this.addListenerHitbox(state)
    this.timeCoundown(state)
  }

}
